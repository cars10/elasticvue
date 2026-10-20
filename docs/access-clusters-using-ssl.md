# Access clusters using SSL

Elasticvue supports clusters using SSL, provided your browser trusts the SSL certificate. Here's how to configure your setup:

## Recommended solution: elasticvue desktop

The simplest approach is to use elasticvue desktop, which is not affected by the browser's certificate restrictions.
[Download](https://github.com/cars10/elasticvue/releases)

## Elasticvue in your browser
If you're not using elasticvue desktop, you need to make sure your browser accepts your cluster's SSL certificate. To test this:

1. Open your cluster's URL in your browser.
2. If you see a certificate warning, your browser doesn't trust the certificate, and elasticvue won't connect. Choose one of the following solutions:

### Option 1: Use a Trusted Certificate Authority

Use a trusted certificate authority (e.g. Let's Encrypt) to generate certificates for your cluster.
Your browser will then accept the certificate automatically. This is the best option for production environments.

### Option 2: Manually Import the Certificate Authority (CA)

Manually add your cluster's CA to your browser's certificate store. The steps vary by browser and OS. Here's how to do it on Linux:

* Chrome: `Settings → Security and Privacy → Security → Manage certificates → Authorities Tab → Import → Select your CA → Check "Trust this CA to identify websites."`    
* Firefox: `Settings → Privacy & Security → Certificates → View Certificates... → Authorities Tab → Import... → Select your CA → Check "Trust this CA to identify websites."`

For elasticsearch 8 and newer, import the file located at: `elasticsearch/config/certs/http_ca.crt`

### Option 3: Temporarily Accept the Certificate

1. When elasticvue displays an error message about the untrusted certificate, click the link to your cluster (or open the URL manually in your browser).
2. Your browser will warn you about the untrusted certificate. Accept the warning and trust the certificate.
3. Return to elasticvue and test the connection again. It should now work.

**Drawback:**
Trusting a certificate this way is only temporary, you may need to repeat these steps every time you restart your browser.

### Option 4: Use a Proxy Server

Set up a local proxy server, such as [simprox](https://github.com/cars10/simprox), to bypass browser restrictions. Here's how:

1. Start the proxy server:
   ```bash
   simprox -h 127.0.0.1:7000 -t https://your.cluster.com --skip-ssl-verify
   ```
2. Connect to `http://localhost:7000` (use **http**, not **https**) in elasticvue. If your cluster uses authentication, enter your username/password in elasticvue.
