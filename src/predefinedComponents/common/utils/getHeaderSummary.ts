interface HeaderSummaryProps {
  title?: string;
  subtitle?: string;
  tag?: string;
  contentIconNumber?: number;
  renderHeader?: unknown;
}

export function getHeaderSummary(props: HeaderSummaryProps): string {
  const { title, subtitle, tag, contentIconNumber, renderHeader } = props;

  // Custom foreground renderers own their content and its semantics.
  const values = renderHeader
    ? [title]
    : [title, subtitle === title ? undefined : subtitle, tag, contentIconNumber];

  return values
    .filter((value) => value !== undefined && String(value).trim() !== '')
    .map((value) => String(value).trim())
    .join(', ');
}
