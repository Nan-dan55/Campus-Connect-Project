
# React + Vite Project Setup & Folder Structure

## 1) If You Clone the Repo

```bash
npm i
````

## 2) If You Start from Scratch

```bash
npm create vite@latest
```

* Choose **React** and **JavaScript**

* If you encounter:

  ```
  'vite' is not recognized as an internal or external command, operable program or batch file.
  ```

  Then run:

  ```bash
  npm i
  ```

* `<>...</>` → This is a **fragment wrapper**

* Use `className` instead of `class`

* File extensions: use `.jsx`

* VS Code extension for React auto-completion:
  👉 **ES7+ React/Redux/React-Native snippets**

* Shortcut `rafce` → creates a React Arrow Function Component with export

## 3) Folder Structure

```
root
├── index.html
├── components
│   └── folders
│       ├── .jsx files
│       ├── their respective .js files
│       └── their respective .css files
├── public
└── src
    ├── assets
    ├── App.css
    ├── App.jsx
    └── main.jsx
```

## 4) Preserve Both `package.json` Files

* Keep both the frontend and backend `package.json` files separate and intact.

## 5) Convert Firebase Service Account Key to Base64

Use the following PowerShell command:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\Chandan U\Desktop\scan hackathon\Backend\config\serviceAccount.json")) > base64.txt
```

This will create a `base64.txt` file containing the encoded service account credentials.

---
