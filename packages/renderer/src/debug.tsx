export function Debug(props: { d: any }) {
  const { d, ...rest } = props;
  return (
    <details {...rest}>
      <summary onClick={() => console.log("debug", d)}>debug</summary>
      <pre>{JSON.stringify(d, null, 2)}</pre>
    </details>
  );
}
