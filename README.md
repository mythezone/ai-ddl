---
title: AI Deadlines
emoji: ⚡
colorFrom: gray
colorTo: blue
sdk: docker
pinned: false
---

# AI Conference Deadlines

A web app to quickly see submission deadlines to top AI conferences, such as NeurIPS and ICLR.

## Project info

This project is entirely based on the awesome https://github.com/paperswithcode/ai-deadlines. As that repository is no longer maintained, we decided to make an up-to-date version along with a new UI.

New data is fetched from https://github.com/ccfddl/ccf-deadlines/tree/main/conference/AI thanks to [this comment](https://github.com/paperswithcode/ai-deadlines/issues/723#issuecomment-2603420945). A CRON job (set up as a Github action) automatically updates the data present at src/data/conferences.yml.

It was bootstrapped using [Lovable](https://lovable.dev/) and [Cursor](https://www.cursor.com/).

**URL**: https://huggingface.co/spaces/huggingface/ai-deadlines

## Add conference data

Simply open a pull request to update src/data/conferences.yml.

## How to run locally

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/NielsRogge/ai-deadlines-hub

# Step 2: Navigate to the project directory.
cd ai-deadlines-hub

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

This runs the app at http://localhost:8080/.

## Deploy with Docker

First build the Docker image as follows:

```bash
docker build -t ai-deadlines .
```

Next it can be run as follows:

```bash
docker run -it -p 7860:7860 ai-deadlines
```

You can see it in your web browser at http://localhost:7860/.

## Technologies used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Maintainers

Feel free to just open an issue. Otherwise contact @nielsrogge