import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { ILoad } from '../types';
import './styles/LoadCard.css';

export const DefaultImage = '/mock_images/default.png';

interface LoadCardProps {
  load: ILoad;
}

export const LoadCard: React.FC<LoadCardProps> = ({ load }) => {
  return (
    <div className="p-4 rounded shadow-sm h-100 load-card d-flex flex-column">
      <Row className="align-items-start flex-grow-1 mb-0">
        <Col xs={4} md={3}>
          <img
            src={load.load_image || DefaultImage}
            alt={load.load_title}
            className="img-fluid"
          />
        </Col>
        <Col xs={8} md={9} className="d-flex flex-column h-100">
          <div className="flex-grow-1">
            <h5 className="fw-bold mb-3">{load.load_title}</h5>
            <div className="mb-2">
              <small className="text-muted">
                Категория: {load.load_category}
              </small>
            </div>
            <div className="mb-2">
              <small className="text-muted">
                Нормативное значение: {load.normative} кН/м²
              </small>
            </div>
          </div>
          <div className="d-flex gap-2 buttons-container">
            <Link
              to={`/loads/${load.id}`}
              className="text-decoration-none"
            >
              <Button className="all-btn" variant="primary" size="sm">
                Подробнее
              </Button>
            </Link>
            <Button className="all-btn" variant="primary" size="sm">
              Добавить
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

