const handlePinSubmit = async (pinEntered) => {
  setLoading(true);
  setError('');

  try {
    // Intentar consultar Supabase
    const { data, error } = await supabase
      .from('admin_config')
      .select('pin_code')
      .eq('id', 1)
      .maybeSingle();

    // Si Supabase responde correctamente
    if (!error && data && data.pin_code) {
      if (data.pin_code === pinEntered) {
        localStorage.setItem('alpaso_admin_active', 'true');
        onLoginSuccess();
        onClose();
        setPin('');
      } else {
        setError('PIN Incorrecto');
      }
    } 
    // Fallback: Si no hay conexión o no existe la tabla, validar directamente contra '2026'
    else if (pinEntered === '2026') {
      localStorage.setItem('alpaso_admin_active', 'true');
      onLoginSuccess();
      onClose();
      setPin('');
    } else {
      setError('Error de conexión o PIN no configurado');
    }
  } catch (err) {
    // Si la promesa de Supabase lanza una excepción
    if (pinEntered === '2026') {
      localStorage.setItem('alpaso_admin_active', 'true');
      onLoginSuccess();
      onClose();
      setPin('');
    } else {
      setError('Error de conexión con la base de datos');
    }
  } finally {
    setLoading(false);
  }
};