const Overlay = () => {
  return (
    <div className="block-ui-container">
      <div className="block-ui-overlay"/>
    </div>
  );
}

const Blocking = (props) => {
  const { children, blocking } = props;

  return (
    <div className={`blocker ${blocking ? "block-ui" : ""}`}>
      { children }
      { blocking && <Overlay /> }
    </div>
  );
}

export default Blocking;
