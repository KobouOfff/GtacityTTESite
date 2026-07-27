type TTELogoProps = {
  className?: string;
};

export function TTELogo({ className }: TTELogoProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        overflow: "hidden",
        flexShrink: 0,
        borderRadius: 4,
        background: "#fff",
      }}
      role="img"
      aria-label="Townsend Transit Express"
    >
      <svg
        viewBox="70 358 1431 443"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
        style={{ display: "block" }}
      >
        <image
          href="/tte-logo-officiel.png"
          width="1536"
          height="1024"
          preserveAspectRatio="none"
        />
      </svg>
    </span>
  );
}
