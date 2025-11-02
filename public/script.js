// GitHub API Configuration
const GITHUB_USERNAME = 'Orpheus-Labs';
const GITHUB_API = 'https://api.github.com';

// State
let allProjects = [];
let currentProject = null;

// DOM Elements
const projectsGallery = document.getElementById('projectsGallery');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const fileTree = document.getElementById('fileTree');
const fileFrame = document.getElementById('fileFrame');
const closeBtn = document.querySelector('.close');

// Initialize
async function init() {
  await fetchProjects();
  setupEventListeners();
}

// Fetch GitHub Projects
async function fetchProjects() {
  try {
    showLoading(true);
    hideError();
    
    const response = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.status}`);
    }
    
    const repos = await response.json();
    
    // Filter out forks if desired, and sort by stars/updated date
    allProjects = repos
      .filter(repo => !repo.fork) // Remove forked repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count);
    
    displayProjects(allProjects);
    showLoading(false);
  } catch (error) {
    console.error('Error fetching projects:', error);
    showError(`Failed to load projects: ${error.message}`);
    showLoading(false);
  }
}

// Display Projects in Gallery
function displayProjects(projects) {
  if (projects.length === 0) {
    projectsGallery.innerHTML = '<p style="text-align: center; color: #00FF00; padding: 40px;">No projects found.</p>';
    return;
  }
  
  projectsGallery.innerHTML = projects.map(project => createProjectCard(project)).join('');
  
  // Add click listeners to cards
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.project-link')) {
        const repoName = card.dataset.repo;
        const project = allProjects.find(p => p.name === repoName);
        openProjectModal(project);
      }
    });
  });
}

// Create Project Card HTML
function createProjectCard(project) {
  const description = project.description || 'No description available';
  const language = project.language || 'N/A';
  const stars = project.stargazers_count || 0;
  const forks = project.forks_count || 0;
  const updatedDate = new Date(project.updated_at).toLocaleDateString();
  
  return `
    <div class="project-card" data-repo="${project.name}">
      <div class="project-header">
        <h3 class="project-name">${project.name}</h3>
        ${language !== 'N/A' ? `<span class="language-tag">${language}</span>` : ''}
      </div>
      <p class="project-description">${description}</p>
      <div class="project-meta">
        <span class="meta-item">⭐ ${stars}</span>
        <span class="meta-item">🔱 ${forks}</span>
        <span class="meta-item">📅 ${updatedDate}</span>
      </div>
      <div class="project-links">
        <a href="${project.html_url}" target="_blank" class="project-link" onclick="event.stopPropagation()">View on GitHub</a>
        <button class="project-link" onclick="event.stopPropagation(); window.dispatchEvent(new CustomEvent('openProject', { detail: '${project.name}' }))">Browse Files</button>
      </div>
    </div>
  `;
}

// Open Project Modal
async function openProjectModal(project) {
  currentProject = project;
  modalTitle.textContent = `${project.name} - Files`;
  modal.style.display = 'block';
  
  await loadProjectFiles(project);
}

// Load Project Files
async function loadProjectFiles(project) {
  try {
    fileTree.innerHTML = '<p style="color: #00FF00; padding: 10px;">Loading files...</p>';
    
    const response = await fetch(`${GITHUB_API}/repos/${GITHUB_USERNAME}/${project.name}/git/trees/${project.default_branch}?recursive=1`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file tree: ${response.status}`);
    }
    
    const data = await response.json();
    const files = data.tree.filter(item => item.type === 'blob');
    
    displayFileTree(files, project);
  } catch (error) {
    console.error('Error loading files:', error);
    fileTree.innerHTML = `<p style="color: #ff0000; padding: 10px;">Error loading files: ${error.message}</p>`;
  }
}

// Display File Tree
function displayFileTree(files, project) {
  const filesByFolder = {};
  
  files.forEach(file => {
    const parts = file.path.split('/');
    if (parts.length === 1) {
      if (!filesByFolder['root']) filesByFolder['root'] = [];
      filesByFolder['root'].push(file);
    } else {
      const folder = parts[0];
      if (!filesByFolder[folder]) filesByFolder[folder] = [];
      filesByFolder[folder].push(file);
    }
  });
  
  let html = '<div style="margin-bottom: 10px; color: #00FF00; font-size: 16px; font-weight: bold;">📁 Project Files</div>';
  
  // Display root files first
  if (filesByFolder['root']) {
    filesByFolder['root'].forEach(file => {
      html += createFileItem(file, project);
    });
  }
  
  // Display folders
  Object.keys(filesByFolder).sort().forEach(folder => {
    if (folder !== 'root') {
      html += `<div class="file-item folder" style="margin-top: 10px;">📁 ${folder}/</div>`;
      filesByFolder[folder].forEach(file => {
        html += createFileItem(file, project, '  ');
      });
    }
  });
  
  fileTree.innerHTML = html;
  
  // Add click listeners
  document.querySelectorAll('.file-item:not(.folder)').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const filePath = item.dataset.path;
      loadFileContent(project, filePath);
    });
  });
}

// Create File Item HTML
function createFileItem(file, project, indent = '') {
  const fileName = file.path.split('/').pop();
  const icon = getFileIcon(fileName);
  
  return `<div class="file-item" data-path="${file.path}">${indent}${icon} ${fileName}</div>`;
}

// Get File Icon
function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const icons = {
    'js': '📜',
    'json': '📋',
    'html': '🌐',
    'css': '🎨',
    'py': '🐍',
    'md': '📝',
    'txt': '📄',
    'png': '🖼️',
    'jpg': '🖼️',
    'gif': '🖼️',
    'svg': '🎭'
  };
  return icons[ext] || '📄';
}

// Load File Content
async function loadFileContent(project, filePath) {
  try {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${project.name}/${project.default_branch}/${filePath}`;
    
    // Determine if it's a viewable file
    const ext = filePath.split('.').pop().toLowerCase();
    const viewableExtensions = ['html', 'css', 'js', 'json', 'md', 'txt', 'py', 'java', 'cpp', 'c', 'h', 'xml', 'yml', 'yaml'];
    
    if (viewableExtensions.includes(ext)) {
      const response = await fetch(rawUrl);
      const content = await response.text();
      
      // Create a formatted view
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              background-color: #000;
              color: #00FF00;
              font-family: 'Lucida Console', 'Courier New', monospace;
              padding: 20px;
              margin: 0;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-size: 13px;
              line-height: 1.5;
            }
            .file-header {
              background-color: #001100;
              padding: 10px;
              margin-bottom: 15px;
              border-left: 3px solid #00FF00;
              color: #00FF00;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="file-header">${filePath}</div>
          <pre>${escapeHtml(content)}</pre>
        </body>
        </html>
      `;
      
      fileFrame.srcdoc = htmlContent;
    } else {
      // For images or other binary files
      fileFrame.src = rawUrl;
    }
  } catch (error) {
    console.error('Error loading file:', error);
    fileFrame.srcdoc = `
      <html>
        <body style="background: #000; color: #ff0000; font-family: monospace; padding: 20px;">
          <h3>Error loading file</h3>
          <p>${error.message}</p>
        </body>
      </html>
    `;
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Search/Filter Projects
function filterProjects() {
  const searchTerm = searchInput.value.toLowerCase();
  
  if (!searchTerm) {
    displayProjects(allProjects);
    return;
  }
  
  const filtered = allProjects.filter(project => {
    return project.name.toLowerCase().includes(searchTerm) ||
           (project.description && project.description.toLowerCase().includes(searchTerm)) ||
           (project.language && project.language.toLowerCase().includes(searchTerm));
  });
  
  displayProjects(filtered);
}

// Setup Event Listeners
function setupEventListeners() {
  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    currentProject = null;
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      currentProject = null;
    }
  });
  
  // Search
  searchInput.addEventListener('input', filterProjects);
  
  // Refresh
  refreshBtn.addEventListener('click', fetchProjects);
  
  // Custom event for opening project
  window.addEventListener('openProject', (e) => {
    const project = allProjects.find(p => p.name === e.detail);
    if (project) openProjectModal(project);
  });
}

// UI Helper Functions
function showLoading(show) {
  loadingMessage.style.display = show ? 'block' : 'none';
}

function hideError() {
  errorMessage.style.display = 'none';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

// Start the application
init();