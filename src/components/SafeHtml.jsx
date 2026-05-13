import DOMPurify from 'dompurify'

export default function SafeHtml({ html, as: Tag = 'span', className, style }) {
  const safe = DOMPurify.sanitize(html || '')

  return (
    <Tag
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
