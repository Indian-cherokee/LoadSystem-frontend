import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Image, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLoadSessionById,
  removeLoadFromSession,
  updateLoadCount,
  deleteLoadSession,
  submitLoadSession,
  clearCurrentSession,
  setError,
  saveLoadSession,
} from '../store/slices/loadSessionSlice';
import { Trash, CheckCircleFill, XCircle } from 'react-bootstrap-icons';
import type { AppDispatch, RootState } from '../store';
import { LoadCard } from '../components/LoadCard';

export const DefaultImage = '/mock_images/default.png';

export const OrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { session_id, loads, loading, error, isDraft, status, room_type } = useSelector((state: RootState) => state.loadSession);
  const [localCounts, setLocalCounts] = useState<{ [key: number]: number }>({});
  const [localRoomType, setLocalRoomType] = useState<string>('');

  useEffect(() => {
    if (id) {
      dispatch(fetchLoadSessionById(id));
    }
    return () => {
      dispatch(clearCurrentSession());
    };
  }, [id, dispatch]);

  // Инициализируем локальные значения при загрузке нагрузок
  useEffect(() => {
    if (loads.length > 0) {
      const counts: { [key: number]: number } = {};
      loads.forEach((loadItem) => {
        if (loadItem.load.id) {
          counts[loadItem.load.id] = loadItem.count;
        }
      });
      setLocalCounts(counts);
    }
  }, [loads.length]);

  // Инициализируем тип помещения при загрузке заявки
  useEffect(() => {
    if (room_type !== undefined) {
      setLocalRoomType(room_type || '');
    }
  }, [room_type]);

  const handleDeleteSession = async () => {
    if (session_id && window.confirm('Удалить заявку?')) {
      try {
        await dispatch(deleteLoadSession(session_id)).unwrap();
        navigate('/loads');
      } catch (err) {
        dispatch(setError('Ошибка при удалении заявки'));
      }
    }
  };

  const handleRemoveLoad = async (loadId: number) => {
    if (session_id) {
      try {
        await dispatch(removeLoadFromSession({ sessionId: session_id, loadId })).unwrap();
      } catch (err) {
        dispatch(setError('Ошибка при удалении нагрузки'));
      }
    }
  };

  const handleUpdateCount = async (loadId: number, count: number) => {
    if (session_id && count > 0) {
      try {
        await dispatch(updateLoadCount({ sessionId: session_id, loadId, count })).unwrap();
      } catch (err) {
        dispatch(setError('Ошибка при обновлении площади'));
      }
    }
  };

  const handleCountChange = (loadId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setLocalCounts(prev => ({
      ...prev,
      [loadId]: numValue
    }));
  };

  const handleCountBlur = (loadId: number) => {
    const count = localCounts[loadId];
    if (count && count > 0) {
      handleUpdateCount(loadId, count);
    }
  };

  const handleRoomTypeBlur = async () => {
    if (session_id && isDraft) {
      // Сохраняем только если значение изменилось
      const currentRoomType = room_type || '';
      if (localRoomType !== currentRoomType) {
        try {
          await dispatch(saveLoadSession({ sessionId: session_id, data: { room_type: localRoomType } })).unwrap();
        } catch (err) {
          dispatch(setError('Ошибка при сохранении типа помещения'));
        }
      }
    }
  };

  const handleSaveRoomType = async () => {
    if (session_id && isDraft) {
      try {
        await dispatch(saveLoadSession({ sessionId: session_id, data: { room_type: localRoomType } })).unwrap();
      } catch (err) {
        dispatch(setError('Ошибка при сохранении типа помещения'));
      }
    }
  };

  const handleSaveOrder = async () => {
    if (session_id) {
      try {
        // Сохраняем заявку - устанавливаем room_type (даже если пустой) чтобы заявка появилась в списке
        // Если room_type был NULL, устанавливаем его (даже пустую строку), чтобы отметить заявку как сохраненную
        const roomTypeToSave = localRoomType || '';
        await dispatch(saveLoadSession({ sessionId: session_id, data: { room_type: roomTypeToSave } })).unwrap();
        // Остаемся на странице корзины после сохранения
      } catch (err) {
        dispatch(setError('Ошибка при сохранении заявки'));
      }
    }
  };

  const handleSubmit = async () => {
    if (session_id) {
      try {
        await dispatch(submitLoadSession(session_id)).unwrap();
        navigate('/loads');
      } catch (err) {
        dispatch(setError('Ошибка при формировании заявки'));
      }
    }
  };

  if (loading || !session_id) {
    return (
      <Container className="pt-5">
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3">Загрузка...</p>
        </div>
      </Container>
    );
  }


  return (
    <Container className="pt-5 mt-5 pb-5">
      {error && (
        <Alert variant="danger" dismissible onClose={() => dispatch(setError(null))}>
          {error}
        </Alert>
      )}

      {/* Поле типа помещения */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Form.Label className="fw-bold mb-2">Тип помещения:</Form.Label>
          {isDraft ? (
            <Row className="g-2">
              <Col>
                <Form.Control
                  type="text"
                  value={localRoomType}
                  onChange={(e) => setLocalRoomType(e.target.value)}
                  onBlur={handleRoomTypeBlur}
                  placeholder="Введите тип помещения"
                />
              </Col>
              <Col xs="auto">
                <Button variant="outline-primary" onClick={handleSaveRoomType}>
                  Сохранить
                </Button>
              </Col>
            </Row>
          ) : (
            <p className="text-muted mb-0">{room_type || 'Не указан'}</p>
          )}
        </Card.Body>
      </Card>

      {/* Список нагрузок */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3">Нагрузки в заявке</h5>
        {loads.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <p className="text-muted">В заявке пока нет нагрузок</p>
              <Link to="/loads">
                <Button variant="warning" style={{ backgroundColor: '#fdc300', borderColor: '#fdc300', color: '#000' }}>
                  Перейти к нагрузкам
                </Button>
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <div className="d-flex flex-column gap-3">
            {loads.map((loadItem) => (
              <Card key={loadItem.load.id} className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <Row className="g-0">
                    <Col md={4} className="d-flex align-items-center p-3 border-end">
                      <div className="me-3" style={{ width: 100 }}>
                        <Image
                          src={loadItem.load.load_image || DefaultImage}
                          fluid
                          rounded
                          style={{ maxHeight: '100px', objectFit: 'cover', width: '100%' }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-2">{loadItem.load.load_title}</h6>
                        <p className="text-muted small mb-2">{loadItem.load.load_category}</p>
                        <Link to={`/loads/${loadItem.load.id}`}>
                          <Button size="sm" variant="outline-warning">Подробнее</Button>
                        </Link>
                      </div>
                    </Col>

                    <Col md={7} className="p-3 bg-light d-flex flex-column">
                      <div className="mb-2">
                        <Form.Label className="mb-1">Метры квадратные:</Form.Label>
                        <Form.Control
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={localCounts[loadItem.load.id] ?? loadItem.count}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (loadItem.load.id) {
                              handleCountChange(loadItem.load.id, value);
                            }
                          }}
                          onBlur={() => {
                            if (loadItem.load.id && isDraft) {
                              handleCountBlur(loadItem.load.id);
                            }
                          }}
                          disabled={!isDraft}
                          style={{ maxWidth: '100px' }}
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-muted small mb-1">
                          <strong>Нормативное значение:</strong> {loadItem.load.normative}
                        </p>
                      </div>
                    </Col>

                    {isDraft && (
                      <Col md={1} className="d-flex align-items-center justify-content-center p-3">
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          title="Удалить из заявки"
                          onClick={() => handleRemoveLoad(loadItem.load.id)}
                        >
                          <Trash size={20} />
                        </Button>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Кнопки управления */}
      {isDraft && (
        <Row>
          <Col className="d-flex gap-2">
            <Button
              variant="outline-danger"
              onClick={handleDeleteSession}
            >
              <XCircle className="me-2" />
              Удалить заявку
            </Button>
          </Col>
          <Col className="text-end d-flex gap-2 justify-content-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSaveOrder}
            >
              Сохранить заявку
            </Button>
            <Button
              variant="success"
              size="lg"
              onClick={handleSubmit}
              disabled={loads.length === 0}
            >
              Сформировать <CheckCircleFill className="ms-2" />
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

