# Hosting elasticvue on a subdirectory

You have to build elasticvue yourself if you want to host it on a path like `example.com/elasticvue`.

Set the `VITE_APP_PUBLIC_PATH` environment variable when building, e.g. in `docker/Dockerfile_nginx`:

```dockerfile
RUN VITE_APP_BUILD_MODE=docker VITE_APP_PUBLIC_PATH=/elasticvue/ npm run build:prod
```

Depending on your setup you also have to adjust your webserver config. With nginx it might look like this:

```nginx
server {
  listen 8080;
  server_name _;
  root /usr/share/nginx/html;

  location ^~ /elasticvue {
    alias /usr/share/nginx/html;
    try_files $uri $uri/ /index.html?$args;
  }
}
```
