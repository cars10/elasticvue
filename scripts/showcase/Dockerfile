FROM mcr.microsoft.com/playwright:v1.64.1-noble

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install

ENTRYPOINT ["sh", "-c", "exec xvfb-run -a -s '-screen 0 3840x2160x24' node src/main.mjs \"$@\"", "--"]
