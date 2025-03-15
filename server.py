from livereload import Server

# Create a server instance
server = Server()

# Watch for changes in HTML, CSS, and JS files
server.watch('*.html')
server.watch('css/*.css')
server.watch('js/*.js')

# Serve files from the current directory on port 5500
server.serve(root='.', port=5500)
