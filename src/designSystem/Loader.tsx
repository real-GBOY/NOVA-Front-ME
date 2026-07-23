interface LoaderProps {
   size?: number;
   label?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 40, label }) => {
   return (
      <div className="flex flex-col items-center gap-6">
         <div className="inline-block relative top-12 z-10">
            <style>{`
        @keyframes box1 {
          0%, 50% {
            transform: translate(100%, 0);
          }
          100% {
            transform: translate(200%, 0);
          }
        }

        @keyframes box2 {
          0% {
            transform: translate(0, 100%);
          }
          50% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100%, 0);
          }
        }

        @keyframes box3 {
          0%, 50% {
            transform: translate(100%, 100%);
          }
          100% {
            transform: translate(0, 100%);
          }
        }

        @keyframes box4 {
          0% {
            transform: translate(200%, 0);
          }
          50% {
            transform: translate(200%, 100%);
          }
          100% {
            transform: translate(100%, 100%);
          }
        }
      `}</style>

            <div
               className="relative"
               style={
                  {
                     "--size": `${size}px`,
                     "--duration": "800ms",
                     height: "calc(var(--size) * 2)",
                     width: "calc(var(--size) * 3)",
                     transformStyle: "preserve-3d",
                     transformOrigin: "50% 50%",
                     marginTop: "calc(var(--size) * 1.5 * -1)",
                     transform:
                        "rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px)",
                  } as React.CSSProperties
               }>
               {/* Box 1 */}
               <div
                  className="absolute top-0 left-0"
                  style={
                     {
                        width: "var(--size)",
                        height: "var(--size)",
                        transformStyle: "preserve-3d",
                        animation: "box1 var(--duration) linear infinite",
                     } as React.CSSProperties
                  }>
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           top: 0,
                           left: 0,
                           transform:
                              "rotateY(0deg) rotateX(0deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           filter: "brightness(0.8)",
                           right: 0,
                           transform:
                              "rotateY(90deg) rotateX(0deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           filter: "brightness(0.9)",
                           transform:
                              "rotateY(0deg) rotateX(-90deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           opacity: 0.1,
                           top: 0,
                           left: 0,
                           transform:
                              "rotateY(0deg) rotateX(0deg) translateZ(calc(var(--size) * 3 * -1))",
                        } as React.CSSProperties
                     }
                  />
               </div>

               {/* Box 2 */}
               <div
                  className="absolute top-0 left-0"
                  style={
                     {
                        width: "var(--size)",
                        height: "var(--size)",
                        transformStyle: "preserve-3d",
                        animation: "box2 var(--duration) linear infinite",
                     } as React.CSSProperties
                  }>
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           top: 0,
                           left: 0,
                           transform:
                              "rotateY(0deg) rotateX(0deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           filter: "brightness(0.8)",
                           right: 0,
                           transform:
                              "rotateY(90deg) rotateX(0deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           filter: "brightness(0.9)",
                           transform:
                              "rotateY(0deg) rotateX(-90deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           opacity: 0.1,
                           top: 0,
                           left: 0,
                           transform:
                              "rotateY(0deg) rotateX(0deg) translateZ(calc(var(--size) * 3 * -1))",
                        } as React.CSSProperties
                     }
                  />
               </div>

               {/* Box 3 */}
               <div
                  className="absolute top-0 left-0"
                  style={
                     {
                        width: "var(--size)",
                        height: "var(--size)",
                        transformStyle: "preserve-3d",
                        animation: "box3 var(--duration) linear infinite",
                     } as React.CSSProperties
                  }>
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           top: 0,
                           left: 0,
                           transform:
                              "rotateY(0deg) rotateX(0deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           filter: "brightness(0.8)",
                           right: 0,
                           transform:
                              "rotateY(90deg) rotateX(0deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           filter: "brightness(0.9)",
                           transform:
                              "rotateY(0deg) rotateX(-90deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           opacity: 0.1,
                           top: 0,
                           left: 0,
                           transform:
                              "rotateY(0deg) rotateX(0deg) translateZ(calc(var(--size) * 3 * -1))",
                        } as React.CSSProperties
                     }
                  />
               </div>

               {/* Box 4 */}
               <div
                  className="absolute top-0 left-0"
                  style={
                     {
                        width: "var(--size)",
                        height: "var(--size)",
                        transformStyle: "preserve-3d",
                        animation: "box4 var(--duration) linear infinite",
                     } as React.CSSProperties
                  }>
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           top: 0,
                           left: 0,
                           transform:
                              "rotateY(0deg) rotateX(0deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           filter: "brightness(0.8)",
                           right: 0,
                           transform:
                              "rotateY(90deg) rotateX(0deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           filter: "brightness(0.9)",
                           transform:
                              "rotateY(0deg) rotateX(-90deg) translateZ(calc(var(--size) / 2))",
                        } as React.CSSProperties
                     }
                  />
                  <div
                     style={
                        {
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: "var(--color-primary)",
                           opacity: 0.1,
                           top: 0,
                           left: 0,
                           transform:
                              "rotateY(0deg) rotateX(0deg) translateZ(calc(var(--size) * 3 * -1))",
                        } as React.CSSProperties
                     }
                  />
               </div>
            </div>
         </div>

         {label && (
            <p
               className="text-text-sub text-lg"
               style={{ marginTop: `${size * 3}px` }}>
               {label}
            </p>
         )}
      </div>
   );
};

export default Loader;
