import React, { useState, useRef } from "react";
import { MdOutlineCloudUpload, MdOutlineImage, MdClose } from "react-icons/md";

const ImageUploadZone = ({ onImageSelected }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      if (onImageSelected) onImageSelected(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const clearImage = () => {
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
    if (onImageSelected) onImageSelected(null);
  };

  return (
    <div className="w-full">
      <p className="mb-2 text-sm font-medium text-navy-700 dark:text-white">
        Upload Ingredient Photo{" "}
        <span className="text-gray-400">(optional)</span>
      </p>

      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
            isDragOver
              ? "border-brand-500 bg-brand-50"
              : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50 dark:border-white/20 dark:bg-navy-700 dark:hover:border-brand-400"
          }`}
        >
          <MdOutlineCloudUpload className="mb-3 h-10 w-10 text-brand-500" />
          <p className="text-sm font-medium text-navy-700 dark:text-white">
            Drag & drop an image here
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            or click to browse — PNG, JPG, WEBP up to 10MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
          <img
            src={preview}
            alt="Uploaded ingredient"
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3">
            <div className="flex items-center gap-2">
              <MdOutlineImage className="h-4 w-4 text-white" />
              <span className="truncate text-xs text-white">{fileName}</span>
            </div>
          </div>
          <button
            onClick={clearImage}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <MdClose className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;
