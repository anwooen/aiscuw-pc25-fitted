interface HeaderProps {
  title: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  centered?: boolean;
}

export const Header = ({ title, subtitle, leftContent, rightContent, centered = false }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        {centered ? (
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-uw-purple dark:text-purple-400">{title}</h1>
          </div>
        ) : leftContent || rightContent ? (
          /* Balanced layout with centered title and content on sides */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {leftContent}
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-uw-purple dark:text-purple-400">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4 flex-1 justify-end">
              {rightContent}
            </div>
          </div>
        ) : (
          /* Simple left-aligned (fallback) */
          <div className="text-center">
            <h1 className="text-2xl font-bold text-uw-purple dark:text-purple-400">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
