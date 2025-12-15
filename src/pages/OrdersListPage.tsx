import React, { useEffect, useState } from 'react';
import { Container, Form, Row, Col, Badge, Spinner, Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserLoadSessions } from '../store/slices/loadSessionSlice';
import type { AppDispatch, RootState } from '../store';

const getStatusBadge = (status: number | undefined) => {
  switch (status) {
    case 1: return <Badge bg="secondary">Черновик</Badge>;
    case 2: return <Badge bg="dark">Удалена</Badge>;
    case 3: return <Badge bg="primary">В работе</Badge>;
    case 4: return <Badge bg="success">Завершена</Badge>;
    case 5: return <Badge bg="danger">Отклонена</Badge>;
    default: return <Badge bg="light" text="dark">Неизвестно</Badge>;
  }
};

export const OrdersListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.loadSession);
  const [sessions, setSessions] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    status: 'all',
    from: '',
    to: ''
  });

  useEffect(() => {
    // Передаем фильтры в API запрос
    const params: { status?: string; from?: string; to?: string } = {};
    if (filters.status !== 'all') {
      // Преобразуем числовой статус в строковое значение для API
      const statusMap: { [key: string]: string } = {
        '1': 'draft',
        '3': 'formed',
        '4': 'completed',
        '5': 'rejected',
      };
      params.status = statusMap[filters.status] || filters.status;
    }
    if (filters.from) {
      // Преобразуем локальную дату начала дня в UTC
      // Создаем дату в локальном времени на начало дня (00:00:00)
      const fromDate = new Date(filters.from + 'T00:00:00');
      // toISOString() автоматически преобразует в UTC
      // Для UTC+3: 15.12.2025 00:00:00 локально = 14.12.2025 21:00:00 UTC
      params.from = fromDate.toISOString().split('T')[0];
    }
    if (filters.to) {
      // Если даты "от" и "до" одинаковые, устанавливаем "до" на конец дня + 1 день в UTC
      if (filters.from === filters.to) {
        const toDate = new Date(filters.to + 'T23:59:59');
        // Преобразуем в UTC и добавляем день
        const toDateUTCStr = toDate.toISOString();
        const toDateUTC = new Date(toDateUTCStr);
        toDateUTC.setUTCDate(toDateUTC.getUTCDate() + 1);
        params.to = toDateUTC.toISOString().split('T')[0];
      } else {
        // Для даты "до" также учитываем часовой пояс и добавляем день
        const toDate = new Date(filters.to + 'T23:59:59');
        const toDateUTCStr = toDate.toISOString();
        const toDateUTC = new Date(toDateUTCStr);
        toDateUTC.setUTCDate(toDateUTC.getUTCDate() + 1);
        params.to = toDateUTC.toISOString().split('T')[0];
      }
    }

    console.log('Fetching orders with params:', params);
    dispatch(fetchUserLoadSessions(params))
      .unwrap()
      .then((data) => {
        console.log('Orders list response:', data);
        console.log('Response type:', typeof data);
        console.log('Is items array?', Array.isArray(data.items));
        console.log('Items value:', data.items);
        const items = Array.isArray(data.items) ? data.items : (data.items ? [data.items] : []);
        console.log('Parsed items:', items);
        console.log('Items count:', items.length);
        setSessions(items);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        setSessions([]);
      });
  }, [dispatch, filters]);

  const handleRowClick = (id: number | undefined) => {
    if (id) navigate(`/load_sessions/${id}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleTodayClick = () => {
    const now = new Date();
    // Используем локальное время, а не UTC
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`; // Формат YYYY-MM-DD
    // Устанавливаем одну и ту же дату в оба поля
    setFilters({ ...filters, from: today, to: today });
  };

  return (
    <Container className="pt-5 mt-5">
      <h2 className="fw-bold mb-4 text-center" style={{ color: '#495057' }}>История заявок</h2>

      <Card className="mb-4 border-0 shadow-sm bg-light">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>Статус</Form.Label>
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="all">Любой статус</option>
                <option value="1">Черновик</option>
                <option value="3">В работе (Сформирована)</option>
                <option value="4">Завершена</option>
                <option value="5">Отклонена</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Дата оформления (от)</Form.Label>
              <Form.Control type="date" name="from" value={filters.from} onChange={handleFilterChange} />
            </Col>
            <Col md={3}>
              <Form.Label>Дата оформления (до)</Form.Label>
              <Form.Control type="date" name="to" value={filters.to} onChange={handleFilterChange} />
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-primary" onClick={handleTodayClick} className="w-100">
                Сегодня
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center"><Spinner animation="border" variant="warning" /></div>
      ) : sessions.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="border-0 shadow-sm"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
              onClick={() => handleRowClick(session.id)}
            >
              <Card.Body className="py-3">
                <Row className="align-items-center g-3">
                  <Col xs={12} sm={1} className="text-center">
                    <div className="fw-bold" style={{ fontSize: '1.2rem' }}>#{session.id}</div>
                  </Col>
                  <Col xs={12} sm={1}>
                    {getStatusBadge(session.status)}
                  </Col>
                  <Col xs={6} sm={2}>
                    <small className="text-muted d-block">Дата создания</small>
                    <div className="small">
                      {session.creation_date
                        ? new Date(session.creation_date).toLocaleDateString('ru-RU')
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  <Col xs={6} sm={2}>
                    <small className="text-muted d-block">Дата оформления</small>
                    <div className="small">
                      {session.forming_date
                        ? new Date(session.forming_date).toLocaleDateString('ru-RU')
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  <Col xs={6} sm={2}>
                    <small className="text-muted d-block">Дата завершения</small>
                    <div className="small">
                      {session.completion_date
                        ? new Date(session.completion_date).toLocaleDateString('ru-RU')
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  <Col xs={6} sm={2}>
                    <small className="text-muted d-block">Тип помещения</small>
                    <div className="small fw-semibold">
                      {session.room_type
                        ? session.room_type
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                  <Col xs={12} sm={2} className="text-end">
                    <small className="text-muted d-block">Итоговая нагрузка</small>
                    <div className="fw-bold" style={{ fontSize: '1.1rem', color: '#495057' }}>
                      {session.total_load !== undefined && session.total_load !== null
                        ? session.total_load.toFixed(2)
                        : <span className="text-muted">--</span>}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">Заявок не найдено</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

