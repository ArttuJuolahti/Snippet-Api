# 📚 Snippet API – REST backend for code snippets

Disclaimer Chat-GPT was used to translate this README.md

This project is a small REST API for storing, reading, updating and deleting code snippets.  
It uses **Node.js + Express** on the backend and **MongoDB Atlas + Mongoose** for data storage.  
The API can be run locally or used via the deployed instance on Render.

> **Live API (Render):** https://snippet-api-1xz2.onrender.com  

---

## 🛠 Tech stack

- **Node.js** & **Express** – HTTP server and routing  
- **MongoDB Atlas** & **Mongoose** – database and ODM  
- **dotenv** – environment variables  
- **CORS** – cross-origin access for future front-end  
- **Git & GitHub** – version control  
- **Render** – deployment platform  

---

## 🔗 Links

- 💻 **GitHub repository:** https://github.com/ArttuJuolahti/Snippet-Api  
- 🌐 **Live API:** https://snippet-api-1xz2.onrender.com  

Example:

- `GET /api/snippets` → https://snippet-api-1xz2.onrender.com/api/snippets  

---

## 🚀 Getting started

### 1. Prerequisites

- Node.js **18+**
- NPM
- A MongoDB Atlas cluster (or other MongoDB instance)

### 2. Clone the repository

```bash
git clone  https://github.com/ArttuJuolahti/Snippet-Api
cd snippet-api
npm install
```

API overview

Base URL (local): http://localhost:3000
Base URL (Render): https://snippet-api-1xz2.onrender.com

Main endpoints:
GET /api/snippets – list snippets (optional ?lang=...&limit=...)

GET /api/snippets/:id – get one snippet

POST /api/snippets – create

PUT /api/snippets/:id – update

DELETE /api/snippets/:id – remove

## Few screenshots from testing 
<img width="940" height="182" alt="image" src="https://github.com/user-attachments/assets/2448285e-c9b5-4b3c-849f-5266bf089fca" />
<img width="940" height="79" alt="image" src="https://github.com/user-attachments/assets/ad67cea2-a179-4d66-8750-9adbac7bde13" />
<img width="940" height="87" alt="image" src="https://github.com/user-attachments/assets/bc71cc93-0486-4677-9716-e8391011d7c0" />
<img width="940" height="84" alt="image" src="https://github.com/user-attachments/assets/29a6f50d-61b8-46b1-91f8-69c5ac66f9fc" />

## Reflections 
In this project I learned how to build a small but complete backend service with Node.js, Express and MongoDB Atlas.
I started from an empty folder and implemented the full CRUD flow for a “snippet” resource, including a schema, routes and basic error handling.
I followed the example structure given in the assignment quite closely, which helped me understand how a simple but realistic API should be organised.
Working with Mongoose helped me see how validation works and how common errors show up, for example when an ID has the wrong format or required fields are missing in the request body.
Using proper status codes (201 for created, 400 for bad request, 404 for not found and 500 for unexpected errors) made the API feel more consistent.

A big learning point was handling environment variables and secrets.
At one point I accidentally committed a .env file and pushed everything to GitHub, even though I already had a .gitignore.
This forced me to rotate my MongoDB credentials, fix the ignore rules and in the end create a clean new repository.
After that I added a safe .env.example file and kept the real values only in my local .env and in the Render dashboard.
This made me much more aware of how easy it is to leak secrets and how important it is to double-check what you are committing.

Deploying to Render also taught me to read logs and debug step by step.
Missing dependencies and MongoDB Atlas network settings caused several errors before everything finally worked.
Overall, the project gave me a clearer picture of what a small production-like backend looks like and what steps are needed from local development to a live URL.

## UI and future improvements

Right now this project focuses on the backend API. As a next step, I would like to build a simple front-end on top of it to make the snippets easier to use without curl or Postman.



