interface AuthFormHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}
