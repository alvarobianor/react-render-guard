import { useRef, useEffect } from "react";

export const useRenderCheck = (componentName: string) => {
  const renders = useRef(0);

  useEffect(() => {
    renders.current += 1;
    console.log(
      `[RenderGuard] ${componentName} rendered ${renders.current} times`,
    );
  });

  return renders.current;
};
