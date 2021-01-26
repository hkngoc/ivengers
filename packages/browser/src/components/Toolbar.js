import {
  ButtonToolbar,
  ButtonGroup,
  Button,
  // OverlayTrigger,
  // Tooltip
} from 'react-bootstrap';

import {
  Gear,
  FileEarmarkArrowDown
} from 'react-bootstrap-icons';

const Toolbar = (props) => {
  const { onSetting } = props;

  return (
    <ButtonToolbar
      id="toolbar"
      className="m-3"
    >
      <ButtonGroup>
        <Button variant="secondary" size="sm">
          <FileEarmarkArrowDown />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="ml-2">
        <Button variant="secondary" size="sm" onClick={onSetting}>
          <Gear />
        </Button>
      </ButtonGroup>
    </ButtonToolbar>
  );
};

export default Toolbar;
