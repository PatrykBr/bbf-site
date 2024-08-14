import React from "react";
import Image from "next/image";

interface ImageCardProps {
  src: string;
  title: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, title }) => {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-black aspect-w-4 aspect-h-3">
        <Image
          src={src}
          alt={title}
          className="object-cover w-full h-full"
          width={300}
          height={225}
        />
        <div className="absolute bottom-0 left-0 bg-gray-800 bg-opacity-75 py-2 px-3 rounded-tr-lg">
          <p className="text-white text-sm truncate max-w-[200px]">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;

// "use client";
// import { useState, useEffect } from "react";

// interface ImageCardProps {
//   src: string;
//   title: string;
// }

// const ImageCard: React.FC<ImageCardProps> = ({ src, title }) => {
//   const [isHorizontal, setIsHorizontal] = useState<boolean>(true);

//   useEffect(() => {
//     const image = new Image();
//     image.src = src;
//     image.onload = () => {
//       const aspectRatio = image.width / image.height;
//       setIsHorizontal(aspectRatio > 1);
//     };
//   }, [src]);

//   return (
//     <div
//       className={`relative overflow-hidden rounded-lg shadow-lg bg-black ${
//         isHorizontal ? "w-96 h-56" : "w-56 h-96"
//       }`}
//     >
//       <img src={src} alt={title} className="object-cover w-full h-full" />
//       <div
//         className={`absolute ${
//           isHorizontal ? "bottom-0 left-0" : "bottom-0 left-0"
//         } bg-gray-800 bg-opacity-75 py-2 px-4 rounded-tr-lg rounded-bl-lg`}
//       >
//         <p className="text-white text-sm">{title}</p>
//       </div>
//     </div>
//   );
// };

// export default ImageCard;
