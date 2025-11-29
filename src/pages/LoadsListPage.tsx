import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Spinner,
  Form,
  Badge,
  Image,
  Button,
} from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { LoadCard } from '../components/LoadCard';
import { getLoads, getCartBadge } from '../api/loadsApi';
import type { ILoad, ICartBadge } from '../types';
import type { RootState } from '../store';
import {
  setSearchTerm,
  setMinNormative,
  setMaxNormative,
  selectSearchTerm,
  selectMinNormative,
  selectMaxNormative,
} from '../store/slices/filterSlice';
import { CustomBreadcrumbs } from '../components/Breadcrumbs';
import './styles/LoadsListPage.css';

export const LoadsListPage = () => {
  const [loads, setLoads] = useState<ILoad[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const searchTerm = useSelector(selectSearchTerm);
  const minNormative = useSelector(selectMinNormative);
  const maxNormative = useSelector(selectMaxNormative);
  const [cartBadge, setCartBadge] = useState<ICartBadge>({
    load_session_id: null,
    loads_count: 0,
  });

  const fetchLoads = (
    filterSearch: string,
    filterMinNormative?: number,
    filterMaxNormative?: number
  ) => {
    setLoading(true);
    getLoads(
      filterSearch || undefined,
      undefined,
      filterMinNormative,
      filterMaxNormative
    )
      .then((data) => {
        if (Array.isArray(data.items)) {
          setLoads(data.items);
        } else {
          console.error('Получены неверные данные:', data);
          setLoads([]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoads(searchTerm, minNormative, maxNormative);
    getCartBadge().then((cartData) => {
      setCartBadge(cartData);
    });
  }, []);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchLoads(searchTerm, minNormative, maxNormative);
  };

  const isCartActive =
    cartBadge.loads_count > 0 && cartBadge.load_session_id !== null;

  const breadcrumbs = [{ label: 'Нагрузки', active: true }];

  return (
    <Container fluid className="pt-5 mt-4">
      <CustomBreadcrumbs crumbs={breadcrumbs} />

      <Form onSubmit={handleSearchSubmit}>
        <Row className="justify-content-center mb-2">
          <Col xs={12} md={10} lg={8}>
            <div className="search-and-cart-wrapper">
              <Form.Control
                type="search"
                placeholder="Введите название нагрузки для поиска..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="me-2"
              />
              <Button
                type="submit"
                className="all-btn"
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  fetchLoads(searchTerm, minNormative, maxNormative);
                }}
              >
                Найти
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center mb-3">
          <Col xs={12} md={3} lg={2}>
            <Form.Control
              type="number"
              placeholder="Мин. нормативное"
              value={minNormative ?? ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (value === '') {
                  dispatch(setMinNormative(undefined));
                } else {
                  const num = parseFloat(value);
                  if (!isNaN(num)) {
                    dispatch(setMinNormative(num));
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchLoads(searchTerm, minNormative, maxNormative);
                }
              }}
              step="0.1"
              className="no-spinner"
            />
          </Col>
          <Col xs={12} md={3} lg={2}>
            <Form.Control
              type="number"
              placeholder="Макс. нормативное"
              value={maxNormative ?? ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (value === '') {
                  dispatch(setMaxNormative(undefined));
                } else {
                  const num = parseFloat(value);
                  if (!isNaN(num)) {
                    dispatch(setMaxNormative(num));
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchLoads(searchTerm, minNormative, maxNormative);
                }
              }}
              step="0.1"
              className="no-spinner"
            />
          </Col>
        </Row>
      </Form>

      {/* Корзина в левом нижнем углу */}
      <div className="cart-fixed">
        {isCartActive ? (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert(
                `Переход на страницу заявки (ID: ${cartBadge.load_session_id}) будет реализован.`
              );
            }}
            title="Перейти к заявке"
          >
            <Image
              src="/mock_images/cart.png"
              alt="Корзина"
              width={32}
            />
          </a>
        ) : (
          <div style={{ cursor: 'not-allowed' }}>
            <Image
              src="/mock_images/cart.png"
              alt="Корзина"
              width={32}
              style={{ opacity: 0.5 }}
            />
          </div>
        )}
        {isCartActive && (
          <Badge pill className="cart-indicator">
            {cartBadge.loads_count}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner 
            animation="border" 
            style={{ 
              color: '#fdc300',
              borderColor: '#fdc300'
            }} 
          />
        </div>
      ) : (
        <Row className="justify-content-center loads-cards-row mt-5">
          <Col xs={12} lg={10}>
            {loads.length === 0 ? (
              <div className="text-center mt-5">
                <h3>Нагрузки не найдены</h3>
                <p className="text-muted">
                  Попробуйте изменить параметры фильтрации
                </p>
              </div>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {loads.map((load) => (
                  <Col key={load.id}>
                    <LoadCard load={load} />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

