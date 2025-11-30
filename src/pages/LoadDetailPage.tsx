import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Row, Col, Button } from 'react-bootstrap';
import { getLoadById } from '../api/loadsApi';
import type { ILoad } from '../types';
import { DefaultImage } from '../components/LoadCard';
import { CustomBreadcrumbs } from '../components/Breadcrumbs';
import './styles/LoadDetailPage.css';

export const LoadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [load, setLoad] = useState<ILoad | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('authToken'));
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getLoadById(id)
        .then((data) => setLoad(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const displayImage = load?.load_image || DefaultImage;

  if (loading) {
    return (
      <div className="load-detail-page">
        <Spinner
          animation="border"
          style={{ 
            width: '3rem', 
            height: '3rem',
            color: '#fdc300',
            borderColor: '#fdc300'
          }}
        />
      </div>
    );
  }

  if (!load) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <h2>Нагрузка не найдена</h2>
        <Link to="/loads">
          <Button 
            className="mt-3 all-btn"
            style={{
              backgroundColor: '#fdc300',
              color: '#000000',
              border: 'none'
            }}
          >
            Вернуться к списку
          </Button>
        </Link>
      </Container>
    );
  }

  const breadcrumbs = [
    { label: 'Нагрузки', path: '/loads' },
    { label: load.load_title, active: true },
  ];

  return (
    <div className="load-detail-page">
      <div className="load-background" />
      <div className="load-content-card">
        <div className="mb-4">
          <CustomBreadcrumbs crumbs={breadcrumbs} />
        </div>
        <div className="load-detail-content">
          <div className="load-header-section">
            <div className="load-icon-wrapper">
              <img
                src={displayImage}
                alt={load.load_title}
                className="load-icon-image"
              />
            </div>
            <h1 className="load-title">{load.load_title}</h1>
          </div>
          
          <div className="load-parameters mt-3">
            <div className="parameter-row">
              <span className="parameter-label">Норматив:</span>
              <span className="parameter-value">{load.normative} кН/м²</span>
            </div>
            <div className="parameter-row">
              <span className="parameter-label">Категория нагрузки:</span>
              <span className="parameter-value">{load.load_category}</span>
            </div>
            <div className="parameter-row">
              <span className="parameter-label">Коэффициент надежности:</span>
              <span className="parameter-value">{load.reliability_coefficient}</span>
            </div>
          </div>

          <div className="load-description mt-3">
            <p>{load.load_description}</p>
          </div>

          {isAuthenticated && (
            <Button
              className="all-btn mt-3 px-4 py-2"
              size="lg"
            >
              Добавить в расчет
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

