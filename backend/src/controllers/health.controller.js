export function getHealth(req, res) {
  return res.status(200).json({
    status: 'success',
    message: 'Smart Waste backend is running',
    timestamp: new Date().toISOString(),
  });
}
