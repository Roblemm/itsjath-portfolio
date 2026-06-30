export function initWorkIconMotion(root: ParentNode = document): () => void {
  const icons = Array.from(root.querySelectorAll<HTMLImageElement>('.work-hero__icon img'));

  if (!icons.length) {
    return () => undefined;
  }

  icons.forEach((icon) => {
    icon.classList.remove('is-floating');
    void icon.offsetWidth;
    icon.classList.add('is-floating');
  });

  return () => {
    icons.forEach((icon) => icon.classList.remove('is-floating'));
  };
}
