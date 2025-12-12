import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError, resetRegisterSuccess } from '../store/slices/userSlice';
import { PersonPlus } from 'react-bootstrap-icons';
import type { AppDispatch, RootState } from '../store';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({ full_name: '', username: '', password: '' });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, registerSuccess } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(clearError());
    dispatch(resetRegisterSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (registerSuccess) {
      navigate('/login');
    }
  }, [registerSuccess, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Container style={{ maxWidth: '450px' }}>
        <Card className="shadow border-0 rounded-4">
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold" style={{ color: '#495057' }}>Регистрация</h2>
              <p className="text-muted">Создайте новый аккаунт</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Floating className="mb-3">
                <Form.Control
                  id="fullName"
                  type="text"
                  placeholder="ФИО"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
                <label htmlFor="fullName" style={{ color: '#495057' }}>ФИО</label>
              </Form.Floating>

              <Form.Floating className="mb-3">
                <Form.Control
                  id="username"
                  type="text"
                  placeholder="Логин"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <label htmlFor="username" style={{ color: '#495057' }}>Логин</label>
              </Form.Floating>

              <Form.Floating className="mb-4">
                <Form.Control
                  id="password"
                  type="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <label htmlFor="password" style={{ color: '#495057' }}>Пароль</label>
              </Form.Floating>

              <Button
                variant="warning"
                type="submit"
                className="w-100 py-3 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: '#fdc300', borderColor: '#fdc300', color: '#000' }}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : <><PersonPlus size={20}/> Создать аккаунт</>}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <span className="text-muted">Уже есть аккаунт? </span>
              <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#fdc300' }}>
                Войти
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

