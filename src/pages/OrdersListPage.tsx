import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Row, Col, Badge, Spinner, Card } from 'react-bootstrap';
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
      params.from = filters.from;
    }
    if (filters.to) {
      params.to = filters.to;
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
    if (id) navigate(`/orders/${id}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
            <Col md={4}>
              <Form.Label>Дата оформления (от)</Form.Label>
              <Form.Control type="date" name="from" value={filters.from} onChange={handleFilterChange} />
            </Col>
            <Col md={4}>
              <Form.Label>Дата оформления (до)</Form.Label>
              <Form.Control type="date" name="to" value={filters.to} onChange={handleFilterChange} />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center"><Spinner animation="border" variant="warning" /></div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <Table hover className="align-middle mb-0 bg-white">
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Дата оформления</th>
                <th>Дата завершения</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? sessions.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => handleRowClick(session.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="fw-bold">{session.id}</td>
                  <td>{getStatusBadge(session.status)}</td>
                  <td>
                    {session.creation_date
                      ? new Date(session.creation_date).toLocaleString('ru-RU')
                      : <span className="text-muted">--</span>}
                  </td>
                  <td>
                    {session.forming_date
                      ? new Date(session.forming_date).toLocaleString('ru-RU')
                      : <span className="text-muted">--</span>}
                  </td>
                  <td>
                    {session.completion_date
                      ? new Date(session.completion_date).toLocaleString('ru-RU')
                      : <span className="text-muted">--</span>}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">Заявок не найдено</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

