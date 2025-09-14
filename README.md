# 🎬 Wander Films

A modern, responsive movie search application with stunning visual effects and glassmorphism design.

## ✨ Features

- **Real-time Movie Search**: Search for movies using the OMDb API
- **Video Background**: Immersive full-screen video background
- **Glassmorphism Design**: Modern liquid glass effects throughout the UI
- **Floating Glass Objects**: Animated glass elements for visual appeal
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Movie Details**: Detailed information for each movie including plot, cast, and ratings
- **Pagination**: Navigate through multiple pages of search results
- **Smooth Animations**: Elegant transitions and hover effects

## 🚀 Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Advanced styling with glassmorphism effects
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **OMDb API**: Movie database integration
- **Backdrop Filter**: CSS backdrop-filter for glass effects
- **CSS Grid & Flexbox**: Responsive layout system

## 📁 Project Structure

```
wanderfilms/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styling and animations
├── js/
│   └── script.js       # Application logic
├── photos/
│   ├── background.mov  # Video background
│   └── logo.png        # Application logo
└── README.md           # Project documentation
```

## 🎨 Design Features

### Glassmorphism Effects
- Semi-transparent backgrounds with backdrop blur
- Subtle borders and shadows
- Consistent glass-like appearance across all elements

### Visual Elements
- Floating animated glass objects
- Video background with overlay
- Smooth hover animations
- Responsive glass containers

### Color Scheme
- White text with shadows for readability
- Semi-transparent white backgrounds
- Light blue accents (#87CEEB)
- Dark overlay for contrast

## 🔧 Setup Instructions

1. **Clone or Download** the project files
2. **Open** `index.html` in a modern web browser
3. **Start searching** for movies!

### Requirements
- Modern web browser with CSS backdrop-filter support
- Internet connection for API calls
- No additional setup or installation required

## 📱 Browser Compatibility

- ✅ Chrome 76+
- ✅ Firefox 103+
- ✅ Safari 9+
- ✅ Edge 79+

*Note: Glassmorphism effects require backdrop-filter support*

## 🎯 Usage

1. **Search Movies**: Type a movie title in the search box
2. **View Results**: Browse through the movie grid
3. **Get Details**: Click on any movie card for detailed information
4. **Navigate**: Use pagination to see more results
5. **Return**: Use the back button to return to search results

## 🔑 API Configuration

The application uses the OMDb API with a demo API key. For production use:

1. Get your own API key from [OMDb API](http://www.omdbapi.com/apikey.aspx)
2. Replace the API key in `js/script.js`:
   ```javascript
   this.apiKey = 'your-api-key-here';
   ```

## 🎨 Customization

### Video Background
- Replace `photos/background.mov` with your own video
- Supported formats: MP4, MOV, WebM
- Recommended resolution: 1920x1080 or higher

### Glass Objects
- Modify glass object positions in CSS
- Adjust animation timing and effects
- Add or remove floating elements

### Colors and Styling
- Update color variables in CSS
- Modify glassmorphism opacity and blur values
- Customize hover effects and transitions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Made with ❤️ and lots of CSS magic**
