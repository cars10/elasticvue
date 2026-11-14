# Building elasticvue

To build elasticvue, first clone the repository:

```bash
git clone https://github.com/cars10/elasticvue.git
cd elasticvue
```

Then build the variant you need.

## Browser extensions

To build the browser extensions for chrome, edge and firefox run:

```bash
make build_browser_extensions
```

This will create zip files in `./artifacts`, for example `elasticvue-1.0.0-chrome.zip`.


## Docker image

Build and run the docker image (see `docker/Dockerfile_nginx`):

```bash
make build_docker_nginx
make run_docker_nginx
```

### Cross compile docker multiarch image

To build the arm images on amd64 you can use `buildx`.

1. Create your buildx builder
   ```bash
   docker buildx create --name mybuilder
   docker buildx use mybuilder
   docker buildx inspect --bootstrap
   ```
2. Install the qemu emulators
   ```bash
   docker run -it --rm --privileged tonistiigi/binfmt --install all
   ```
3. Build (this uses `docker/Dockerfile_multiarch` for faster builds)
   ```bash
   make build_docker_nginx_multiarch
   ```

## Web version (for self hosting)

To build the static files into `dist` run:

```bash
npm install
npm run build:prod
```

Serve `dist` with any webserver, see `docker/nginx/elasticvue.conf` for an example nginx config. Note that you have to [configure CORS](../README.md#elasticsearch-configuration) for your cluster when self-hosting. To host elasticvue on a path like `example.com/elasticvue` see [Hosting elasticvue on a subdirectory](hosting-elasticvue-on-a-subdirectory.md).

## Desktop app

### Docker

You can use this command to build the tauri desktop app for linux inside a docker image:

```bash
make build_docker_tauri
```

Find the build artifacts in `src-tauri/target/release/bundle`

### Native

Elasticvue uses [tauri](https://tauri.app/) to create the desktop application.

1. [Install rust](https://rustup.rs/)
2. Install the [tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS
3. Install the dependencies (includes the tauri cli): `npm install`
4. Build for prod: `make build_tauri`

Find the build artifacts in `src-tauri/target/release/bundle`
