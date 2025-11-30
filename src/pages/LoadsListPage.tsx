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
import {
  setSearchTerm,
  selectSearchTerm,
} from '../store/slices/filterSlice';
import { CustomBreadcrumbs } from '../components/Breadcrumbs';
import './styles/LoadsListPage.css';

export const LoadsListPage = () => {
  const [loads, setLoads] = useState<ILoad[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const searchTerm = useSelector(selectSearchTerm);
  const [cartBadge, setCartBadge] = useState<ICartBadge>({
    load_session_id: null,
    loads_count: 0,
  });

  const fetchLoads = (filterSearch: string) => {
    setLoading(true);
    getLoads(
      filterSearch || undefined
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
    fetchLoads(searchTerm);
    getCartBadge().then((cartData) => {
      setCartBadge(cartData);
    });
  }, []);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchLoads(searchTerm);
  };

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const cartData = await getCartBadge();
      setCartBadge(cartData);
      if (cartData.load_session_id) {
        alert(
          `Переход на страницу заявки (ID: ${cartData.load_session_id}) будет реализован.`
        );
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
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
                  fetchLoads(searchTerm);
                }}
              >
                Найти
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* Корзина в левом нижнем углу */}
      <div className="cart-fixed">
        <div
          onClick={handleCartClick}
          title={isCartActive ? "Перейти к заявке" : "Корзина"}
          style={{ cursor: 'pointer', display: 'inline-block' }}
        >
          <Image
            src={`${import.meta.env.BASE_URL}mock_images/cart.png`}
            alt="Корзина"
            width={32}
            style={{ opacity: isCartActive ? 1 : 0.7 }}
          />
        </div>
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

