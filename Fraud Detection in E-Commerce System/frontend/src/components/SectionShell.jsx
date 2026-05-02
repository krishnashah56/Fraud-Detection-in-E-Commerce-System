const SectionShell = ({ eyebrow, title, description, children }) => {
  return (
    <section className="glass-panel rounded-[32px] border border-white/70 p-6 shadow-panel lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">{title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">{description}</p>
        </div>
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
};

export default SectionShell;
