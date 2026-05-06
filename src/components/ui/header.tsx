interface HeaderProps {
  heading: string;
  text?: string;
}

export function Header({ heading, text }: HeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}
