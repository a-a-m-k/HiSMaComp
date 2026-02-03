export const hasBackdropBlurStyles = (): boolean => {
  const emotionStyles = Array.from(
    document.querySelectorAll("style[data-emotion]")
  )
    .map(style => style.textContent || "")
    .join(" ");
  return (
    emotionStyles.includes("backdrop-filter:blur(4px)") ||
    emotionStyles.includes("backdrop-filter: blur(4px)")
  );
};
