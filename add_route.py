with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("import PrivateRoute from './components/PrivateRoute';", "import PrivateRoute from './components/PrivateRoute';\nimport Receipt from './pages/Receipt';")
code = code.replace("<Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>", "<Route path=\"/receipt/:type/:id\" element={<PrivateRoute><Receipt /></PrivateRoute>} />\n        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("done")
