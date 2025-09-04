import { Toaster as Sonner, ToasterProps } from "sonner";

interface ToasterPropsWithContainer extends ToasterProps {
  container?: HTMLElement;
}

const Toaster = ({ container, ...props }: ToasterPropsWithContainer) => {
  const theme = "dark";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      {...(container && {
        // richColors: true,
        expand: true,
        position: "bottom-center",
      })}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
