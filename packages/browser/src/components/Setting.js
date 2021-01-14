import {
  Modal,
  Tab,
  Row,
  Col,
  Nav,
  Form,
  Button
} from 'react-bootstrap';

const Setting = (props) => {
  const { show, onHide } = props;

  return (
    <Modal
      show={show}
      onHide={onHide}
      scrollable
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body className="setting-body">
        <Tab.Container defaultActiveKey="zero">
          <Row>
            <Col sm={3} className="d-flex flex-column">
              <Nav className="flex-column nav-tabs-vertical">
                <Nav.Item>
                  <Nav.Link eventKey="zero">Host</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="first">Team</Nav.Link>
                </Nav.Item>
              </Nav>
              <div className="nav-remain"></div>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey="zero">
                  <h1>Host</h1>
                </Tab.Pane>
                <Tab.Pane eventKey="first">
                  <h1>Team</h1>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  );
};

export default Setting;
