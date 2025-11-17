import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Spinner,
  Form,
  Badge,
  Image,
} from 'react-bootstrap';
import { LoadCard } from '../components/LoadCard';
import { getLoads, getCartBadge } from '../api/loadsApi';
import type { ILoad, ICartBadge } from '../types';
import { CustomBreadcrumbs } from '../components/Breadcrumbs';
import './styles/LoadsListPage.css';

export const LoadsListPage = () => {
  const [loads, setLoads] = useState<ILoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [minNormative, setMinNormative] = useState<number | undefined>(
    undefined
  );
  const [maxNormative, setMaxNormative] = useState<number | undefined>(
    undefined
  );
  const [cartBadge, setCartBadge] = useState<ICartBadge>({
    load_session_id: null,
    loads_count: 0,
  });

  const fetchLoads = (
    filterSearch: string,
    filterCategory: string,
    filterMinNormative?: number,
    filterMaxNormative?: number
  ) => {
    setLoading(true);
    getLoads(
      filterSearch || undefined,
      filterCategory || undefined,
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
    fetchLoads('', '', undefined, undefined);
    getCartBadge().then((cartData) => {
      setCartBadge(cartData);
    });
  }, []);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchLoads(searchTerm, category, minNormative, maxNormative);
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="me-2"
              />
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center mb-3">
          <Col xs={12} md={5} lg={3}>
            <Form.Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                // Автоматический поиск при изменении категории
                setTimeout(() => {
                  fetchLoads(searchTerm, e.target.value, minNormative, maxNormative);
                }, 0);
              }}
            >
              <option value="">Все категории</option>
              <option value="Постоянная">Постоянная</option>
              <option value="Временная">Временная</option>
            </Form.Select>
          </Col>
          <Col xs={12} md={3} lg={2}>
            <Form.Control
              type="number"
              placeholder="Мин. нормативное"
              value={minNormative ?? ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (value === '') {
                  setMinNormative(undefined);
                } else {
                  const num = parseFloat(value);
                  if (!isNaN(num)) {
                    setMinNormative(num);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchLoads(searchTerm, category, minNormative, maxNormative);
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
                  setMaxNormative(undefined);
                } else {
                  const num = parseFloat(value);
                  if (!isNaN(num)) {
                    setMaxNormative(num);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchLoads(searchTerm, category, minNormative, maxNormative);
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

