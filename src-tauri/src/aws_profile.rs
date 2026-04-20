use configparser::ini::Ini;
use serde::Serialize;
use std::env;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResolvedAwsCredentials {
    pub access_key_id: String,
    pub secret_access_key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_token: Option<String>,
    pub region: String,
}

fn aws_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(".aws"))
}

fn credentials_path() -> Option<PathBuf> {
    aws_dir().map(|d| d.join("credentials"))
}

fn config_path() -> Option<PathBuf> {
    aws_dir().map(|d| d.join("config"))
}

fn credentials_section(profile_name: &str) -> &str {
    if profile_name.is_empty() {
        "default"
    } else {
        profile_name
    }
}

fn config_section(profile_name: &str) -> String {
    if profile_name.is_empty() || profile_name == "default" {
        "default".to_string()
    } else {
        format!("profile {}", profile_name)
    }
}

fn credentials_from_env(region_override: Option<&str>) -> Option<ResolvedAwsCredentials> {
    let access_key_id = env::var("AWS_ACCESS_KEY_ID").ok()?;
    let secret_access_key = env::var("AWS_SECRET_ACCESS_KEY").ok()?;
    if access_key_id.trim().is_empty() || secret_access_key.trim().is_empty() {
        return None;
    }
    let session_token = env::var("AWS_SESSION_TOKEN").ok();
    let region = region_override
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .or_else(|| env::var("AWS_REGION").ok())
        .or_else(|| env::var("AWS_DEFAULT_REGION").ok())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())?;
    Some(ResolvedAwsCredentials {
        access_key_id: access_key_id.trim().to_string(),
        secret_access_key: secret_access_key.trim().to_string(),
        session_token: session_token.map(|s| s.trim().to_string()).filter(|s| !s.is_empty()),
        region,
    })
}

fn resolve_aws_profile_inner(
    profile_name: String,
    region: Option<String>,
) -> Result<ResolvedAwsCredentials, String> {
    resolve_aws_profile_with_paths(profile_name, region, credentials_path(), config_path())
}

fn resolve_aws_profile_with_paths(
    profile_name: String,
    region: Option<String>,
    credentials_path: Option<PathBuf>,
    config_path: Option<PathBuf>,
) -> Result<ResolvedAwsCredentials, String> {
    let profile = if profile_name.is_empty() {
        "default"
    } else {
        profile_name.as_str()
    };
    let region_override = region.as_deref();

    let creds_path = credentials_path.ok_or("Could not resolve home directory")?;
    if !creds_path.exists() {
        if let Some(creds) = credentials_from_env(region_override) {
            return Ok(creds);
        }
        return Err(format!(
            "AWS credentials file not found: {}. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY or create the file.",
            creds_path.display()
        ));
    }

    let mut creds_ini = Ini::new();
    if let Err(e) = creds_ini.load(&creds_path) {
        if let Some(creds) = credentials_from_env(region_override) {
            return Ok(creds);
        }
        return Err(format!("Failed to parse credentials file: {}", e));
    }

    let section = credentials_section(profile);
    let access_key_id = match creds_ini.get(section, "aws_access_key_id") {
        Some(v) if !v.trim().is_empty() => v,
        _ => {
            if let Some(creds) = credentials_from_env(region_override) {
                return Ok(creds);
            }
            return Err(format!(
                "Profile [{}] not found or missing aws_access_key_id. Check the profile name or set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.",
                section
            ));
        }
    };
    let secret_access_key = match creds_ini.get(section, "aws_secret_access_key") {
        Some(v) if !v.trim().is_empty() => v,
        _ => {
            if let Some(creds) = credentials_from_env(region_override) {
                return Ok(creds);
            }
            return Err(format!(
                "Profile [{}] not found or missing aws_secret_access_key. Check the profile name or set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.",
                section
            ));
        }
    };
    let session_token = creds_ini.get(section, "aws_session_token");

    // Resolve region in order of precedence:
    // 1. Region passed from the UI (Profile tab)
    // 2. Region in the credentials file section
    // 3. Region in ~/.aws/config for the matching profile
    let region = match region {
        Some(r) if !r.trim().is_empty() => r.trim().to_string(),
        _ => {
            if let Some(r) = creds_ini.get(section, "region") {
                r.trim().to_string()
            } else if let Some(config_path) = &config_path {
                if config_path.exists() {
                    let mut config_ini = Ini::new();
                    if let Ok(_) = config_ini.load(config_path) {
                        let config_section = config_section(profile);
                        if let Some(r) = config_ini.get(&config_section, "region") {
                            r.trim().to_string()
                        } else {
                            return Err("Region is required (set in form, credentials file, or ~/.aws/config)".to_string());
                        }
                    } else {
                        return Err("Failed to parse ~/.aws/config while resolving region".to_string());
                    }
                } else {
                    return Err("Region is required (set in form, credentials file, or ~/.aws/config)".to_string());
                }
            } else {
                return Err("Region is required (set in form, credentials file, or ~/.aws/config)".to_string());
            }
        }
    };

    Ok(ResolvedAwsCredentials {
        access_key_id: access_key_id.trim().to_string(),
        secret_access_key: secret_access_key.trim().to_string(),
        session_token: session_token.map(|s| s.trim().to_string()),
        region,
    })
}

#[tauri::command]
pub async fn resolve_aws_profile(
    profile_name: String,
    region: Option<String>,
) -> Result<ResolvedAwsCredentials, String> {
    resolve_aws_profile_inner(profile_name, region)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::sync::{Mutex, OnceLock};
    use std::time::{SystemTime, UNIX_EPOCH};

    fn env_lock() -> &'static Mutex<()> {
        static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
        LOCK.get_or_init(|| Mutex::new(()))
    }

    struct EnvVarGuard {
        key: &'static str,
        old_value: Option<String>,
    }

    impl EnvVarGuard {
        fn set(key: &'static str, value: Option<&str>) -> Self {
            let old_value = env::var(key).ok();
            match value {
                Some(v) => env::set_var(key, v),
                None => env::remove_var(key),
            }
            Self { key, old_value }
        }
    }

    impl Drop for EnvVarGuard {
        fn drop(&mut self) {
            if let Some(old_value) = &self.old_value {
                env::set_var(self.key, old_value);
            } else {
                env::remove_var(self.key);
            }
        }
    }

    fn write_credentials_file(file_content: &str) -> PathBuf {
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        let dir = env::temp_dir().join(format!("elasticvue-aws-profile-test-{}", ts));
        fs::create_dir_all(&dir).expect("failed to create test directory");
        let credentials = dir.join("credentials");
        fs::write(&credentials, file_content)
            .expect("failed to write test credentials file");
        credentials
    }

    #[test]
    fn falls_back_to_env_when_profile_missing_access_key() {
        let _env_lock = env_lock().lock().expect("env lock poisoned");
        let credentials_path = write_credentials_file("[default]\naws_secret_access_key=PROFILE_SECRET\n");
        let _access_key_guard = EnvVarGuard::set("AWS_ACCESS_KEY_ID", Some("ENV_ACCESS"));
        let _secret_key_guard = EnvVarGuard::set("AWS_SECRET_ACCESS_KEY", Some("ENV_SECRET"));
        let _session_token_guard = EnvVarGuard::set("AWS_SESSION_TOKEN", Some("ENV_TOKEN"));
        let _region_guard = EnvVarGuard::set("AWS_REGION", Some("eu-central-1"));
        let _default_region_guard = EnvVarGuard::set("AWS_DEFAULT_REGION", None);

        let resolved = resolve_aws_profile_with_paths(
            "default".to_string(),
            None,
            Some(credentials_path),
            None,
        )
        .expect("should resolve from env");
        assert_eq!(resolved.access_key_id, "ENV_ACCESS");
        assert_eq!(resolved.secret_access_key, "ENV_SECRET");
        assert_eq!(resolved.session_token.as_deref(), Some("ENV_TOKEN"));
        assert_eq!(resolved.region, "eu-central-1");
    }

    #[test]
    fn falls_back_to_env_when_profile_missing_secret_key() {
        let _env_lock = env_lock().lock().expect("env lock poisoned");
        let credentials_path = write_credentials_file("[default]\naws_access_key_id=PROFILE_ACCESS\n");
        let _access_key_guard = EnvVarGuard::set("AWS_ACCESS_KEY_ID", Some("ENV_ACCESS"));
        let _secret_key_guard = EnvVarGuard::set("AWS_SECRET_ACCESS_KEY", Some("ENV_SECRET"));
        let _session_token_guard = EnvVarGuard::set("AWS_SESSION_TOKEN", Some("ENV_TOKEN"));
        let _region_guard = EnvVarGuard::set("AWS_REGION", Some("eu-central-1"));
        let _default_region_guard = EnvVarGuard::set("AWS_DEFAULT_REGION", None);

        let resolved = resolve_aws_profile_with_paths(
            "default".to_string(),
            None,
            Some(credentials_path),
            None,
        )
        .expect("should resolve from env");
        assert_eq!(resolved.access_key_id, "ENV_ACCESS");
        assert_eq!(resolved.secret_access_key, "ENV_SECRET");
        assert_eq!(resolved.session_token.as_deref(), Some("ENV_TOKEN"));
        assert_eq!(resolved.region, "eu-central-1");
    }

    #[test]
    fn returns_error_for_incomplete_profile_without_env() {
        let _env_lock = env_lock().lock().expect("env lock poisoned");
        let credentials_path = write_credentials_file("[default]\naws_access_key_id=PROFILE_ACCESS\n");
        let _access_key_guard = EnvVarGuard::set("AWS_ACCESS_KEY_ID", None);
        let _secret_key_guard = EnvVarGuard::set("AWS_SECRET_ACCESS_KEY", None);
        let _session_token_guard = EnvVarGuard::set("AWS_SESSION_TOKEN", None);
        let _region_guard = EnvVarGuard::set("AWS_REGION", None);
        let _default_region_guard = EnvVarGuard::set("AWS_DEFAULT_REGION", None);

        let err = resolve_aws_profile_with_paths(
            "default".to_string(),
            None,
            Some(credentials_path),
            None,
        )
        .expect_err("should fail");
        assert!(err.contains("aws_secret_access_key"));
    }
}
