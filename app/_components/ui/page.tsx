

export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return  <div className="space-y-6 p-5">{children}</div>
}; 

export const PageSectionTitle = ({ children }: { children: string }) => {
    return <h2 className='text-xs text-foreground font-semibold uppercase'>
        {children}
       </h2>
};

export const PageSection = ({ children }: { children: React.ReactNode }) => {
    return <section className='space-y-3'>
        {children}
       </section>
};

export const PageScrollContainer = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {children}
       </div>
};