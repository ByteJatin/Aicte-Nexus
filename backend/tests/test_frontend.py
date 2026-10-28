def test_frontend_and_public_assets(client):
    response = client.get('/')
    assert response.status_code == 200
    assert 'Every case. One connected view.' in response.text
    for asset in ['/AICTE.html', '/css/styles.css', '/js/app.js', '/js/ui.js']:
        assert client.get(asset).status_code == 200
    assert client.get('/api/health').json()['status'] == 'ok'


def test_server_does_not_publish_private_project_files(client):
    for path in ['/backend/.env', '/backend/aicte_nexus.db', '/backend/app/main.py', '/README.md']:
        assert client.get(path).status_code == 404
