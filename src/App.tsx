import { useState,useEffect } from "react";

function App() {
  const [fileSize, setFileSize] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading,setLoading] = useState(false);
  useEffect(() => {
    setMessage("")
  },[file])
  const onClick = async () => {
    setLoading(true);
    if (fileSize === 0 || !file) {
      alert("Please select a file before submitting.");
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://sketch-backend-7iey.onrender.com/process-image", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || "Upload failed.");
        setLoading(false);
        return;
      }

      // Read image blob and convert to URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setMessage("Sketch generated successfully!");

      // Open image in new tab with download button
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Sketch Image</title>
              <style>
                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f3f4f6; margin: 0; }
                img { max-width: 90vw; max-height: 70vh; border-radius: 8px; box-shadow: 0 2px 8px #0002; }
                a { margin-top: 24px; padding: 12px 24px; background: #16a34a; color: #fff; border-radius: 6px; text-decoration: none; font-size: 1.1rem; }
                a:hover { background: #15803d; }
              </style>
            </head>
            <body>
              <img src="${imageUrl}" alt="Sketch" />
              <a href="${imageUrl}" download="sketch.png">Download Sketch</a>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (err) {
      setMessage("Upload failed.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="lg:text-2xl md:text-lg mb-10">
        Upload The Picture To Convert Into Sketches
      </div>
      <div className="bg-white p-6 rounded shadow">
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={e => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              if (selectedFile.size > 16 * 1024 * 1024) {
                alert("File size must be less than 16MB");
                e.target.value = "";
                setFileSize(0);
                setFile(null);
              } else {
                setFileSize(selectedFile.size);
                setFile(selectedFile);
              }
            } else {
              setFileSize(0);
              setFile(null);
            }
          }}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={onClick}
          className={`mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${fileSize === 0 ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={fileSize === 0 || loading}
        >
          Submit
        </button>
      </div>
      {message && <div className="mt-4 text-green-600">{message}</div>}
    </div>
  );
}

export default App;
