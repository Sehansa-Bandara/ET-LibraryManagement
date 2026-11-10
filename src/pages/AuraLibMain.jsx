import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import * as THREE from 'three';
import logoImg from '../assets/logo.jpg';
import {
  Search,
  BookOpen,
  Compass,
  Layers,
  User,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Filter,
  X,
  Eye,
  Calendar,
  ShieldCheck,
  QrCode,
  SlidersHorizontal,
  Menu,
  BookMarked,
  Library,
  Award,
  Cpu,
  Globe,
  RotateCcw,
  Sun,
  LogOut,
  RotateCw,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { apiRequest, getApiError } from '../lib/api';

// ============================================================================
// 1. TYPOGRAPHY & GLOBAL ARCHITECTURAL STYLES
// ============================================================================
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --bg-ivory: #F7F4EE;
      --bg-parchment: #EFECE6;
      --bg-travertine: #E4DEC8;
      --wood-espresso: #231710;
      --wood-walnut: #3A261A;
      --gold-champagne: #C5A368;
      --gold-light: #D4B886;
      --accent-forest: #234233;
      --sunlight-warm: #FFF9EB;
    }

    body {
      background-color: #F7F4EE;
      color: #231710;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      margin: 0;
      padding: 0;
      selection-background-color: #C5A368;
      selection-color: #231710;
    }

    .font-editorial {
      font-family: 'Cormorant Garamond', Georgia, serif;
    }

    .font-sans-ui {
      font-family: 'DM Sans', sans-serif;
    }

    .font-mono-code {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Custom subtle architectural scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #EFECE6;
    }
    ::-webkit-scrollbar-thumb {
      background: #C5A368;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3A261A;
    }

    /* Glassmorphic architectural panels */
    .arch-glass {
      background: rgba(247, 244, 238, 0.86);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(197, 163, 104, 0.35);
      box-shadow: 0 20px 50px rgba(35, 23, 16, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }

    .arch-glass-dark {
      background: rgba(35, 23, 16, 0.88);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(197, 163, 104, 0.3);
      box-shadow: 0 24px 60px rgba(15, 10, 6, 0.35);
    }

    /* Interactive 3D Book Card CSS perspective */
    .perspective-1000 {
      perspective: 1200px;
    }
    .preserve-3d {
      transform-style: preserve-3d;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `}</style>
);

// ============================================================================
// 2. PROCEDURAL TEXTURE GENERATORS (WOOD, TRAVERTINE, BOOK COVERS)
// ============================================================================
const textureCache = new Map();

function createWoodTexture() {
  if (textureCache.has('wood')) return textureCache.get('wood');
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich Walnut Base
  ctx.fillStyle = '#382417';
  ctx.fillRect(0, 0, 512, 512);

  // Organic Wood Grain Fibers
  for (let i = 0; i < 420; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(26, 15, 9, 0.24)' : 'rgba(82, 52, 34, 0.16)';
    const x = Math.random() * 512;
    const w = 1 + Math.random() * 5;
    ctx.fillRect(x, 0, w, 512);
  }

  // Subtle growth rings
  ctx.strokeStyle = 'rgba(22, 12, 7, 0.18)';
  ctx.lineWidth = 2;
  for (let j = 0; j < 18; j++) {
    ctx.beginPath();
    const startX = (j / 18) * 512;
    ctx.moveTo(startX, 0);
    ctx.bezierCurveTo(
      startX + Math.sin(j) * 28,
      170,
      startX - Math.cos(j) * 28,
      340,
      startX,
      512
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  textureCache.set('wood', texture);
  return texture;
}

function createTravertineTexture() {
  if (textureCache.has('travertine')) return textureCache.get('travertine');
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm Ivory Stone Base
  ctx.fillStyle = '#EAE4D3';
  ctx.fillRect(0, 0, 512, 512);

  // Sedimentary mineral veins
  for (let y = 0; y < 512; y += 3) {
    const alpha = 0.03 + Math.random() * 0.06;
    ctx.fillStyle = y % 6 === 0 ? `rgba(196, 184, 158, ${alpha})` : `rgba(255, 251, 242, ${alpha})`;
    ctx.fillRect(0, y, 512, 2 + Math.random() * 4);
  }

  // Architectural tile grid lines
  ctx.strokeStyle = 'rgba(165, 152, 128, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 252, 252);
  ctx.strokeRect(256, 2, 252, 252);
  ctx.strokeRect(2, 256, 252, 252);
  ctx.strokeRect(256, 256, 252, 252);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 26);
  textureCache.set('travertine', texture);
  return texture;
}

function generateBookCoverDataURL(book) {
  const cacheKey = `cover_${book.id}_${book.title}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 580;
  const ctx = canvas.getContext('2d');

  const palette = book.coverPalette || {
    primary: '#23392D',
    accent: '#C5A368',
    text: '#F7F4EE'
  };

  // Base cloth cover background
  ctx.fillStyle = palette.primary;
  ctx.fillRect(0, 0, 400, 580);

  // Subtle linen texture weave
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 400; i += 4) {
    ctx.fillRect(i, 0, 1, 580);
  }
  for (let j = 0; j < 580; j += 4) {
    ctx.fillRect(0, j, 400, 1);
  }

  // Spine crease shadow on left
  const spineGrad = ctx.createLinearGradient(0, 0, 32, 0);
  spineGrad.addColorStop(0, 'rgba(0,0,0,0.45)');
  spineGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
  spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, 32, 580);

  // Champagne gold architectural frame
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 344, 524);
  ctx.lineWidth = 0.75;
  ctx.strokeRect(36, 36, 328, 508);

  // Geometric emblem in center
  ctx.save();
  ctx.translate(200, 250);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;

  const cat = book.category || 'General';
  if (cat === 'Architecture' || cat === 'History') {
    // Archway motif
    ctx.beginPath();
    ctx.arc(0, -10, 55, Math.PI, 0, false);
    ctx.lineTo(55, 65);
    ctx.lineTo(-55, 65);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -10, 38, Math.PI, 0, false);
    ctx.lineTo(38, 65);
    ctx.lineTo(-38, 65);
    ctx.stroke();
  } else if (cat === 'Science' || cat === 'Technology' || cat === 'Information Technology') {
    // Astrolabe / orbital rings
    for (let r = 22; r <= 66; r += 22) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-75, 0);
    ctx.lineTo(75, 0);
    ctx.moveTo(0, -75);
    ctx.lineTo(0, 75);
    ctx.stroke();
  } else {
    // Layered diamond motif
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-45, -45, 90, 90);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-45, -45, 90, 90);
  }
  ctx.restore();

  // Category header
  ctx.fillStyle = palette.accent;
  ctx.font = '500 11px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`AURALIB LK • ${cat.toUpperCase()}`, 200, 68);

  // Editorial Book Title (word-wrapped)
  ctx.fillStyle = palette.text;
  ctx.font = '600 28px "Cormorant Garamond", Georgia, serif';
  const words = (book.title || 'Untitled Volume').split(' ');
  let line = '';
  let y = 115;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (testLine.length > 18 && n > 0) {
      ctx.fillText(line.trim(), 200, y);
      line = words[n] + ' ';
      y += 32;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 200, y);

  // Subtitle
  ctx.fillStyle = palette.accent;
  ctx.font = 'italic 14px "Cormorant Garamond", Georgia, serif';
  ctx.fillText((book.subtitle || '').slice(0, 38), 200, 385);

  // Author
  ctx.fillStyle = palette.text;
  ctx.font = '500 15px "DM Sans", sans-serif';
  ctx.fillText((book.author || 'UNKNOWN AUTHOR').toUpperCase(), 200, 485);

  // Call Number Footer
  ctx.fillStyle = palette.accent;
  ctx.font = '400 11px "JetBrains Mono", monospace';
  ctx.fillText(book.callNumber || 'AURALIB COLOMBO', 200, 525);

  const dataUrl = canvas.toDataURL('image/png');
  textureCache.set(cacheKey, dataUrl);
  return dataUrl;
}

// ============================================================================
// 3. CURATED DATASET & REFINED FORMATTERS
// ============================================================================
const DEFAULT_PALETTES = [
  { primary: '#23392D', accent: '#C5A368', text: '#F7F4EE' },
  { primary: '#3A1E1A', accent: '#D4B886', text: '#FFF9EB' },
  { primary: '#1E2936', accent: '#C5A368', text: '#F7F4EE' },
  { primary: '#2B3325', accent: '#C5A368', text: '#F7F4EE' },
  { primary: '#473628', accent: '#D4B886', text: '#FFF9EB' },
  { primary: '#231710', accent: '#C5A368', text: '#F7F4EE' },
  { primary: '#3D271D', accent: '#D4B886', text: '#F7F4EE' },
  { primary: '#1F332C', accent: '#C5A368', text: '#F7F4EE' },
  { primary: '#2D231E', accent: '#C5A368', text: '#FFF9EB' },
  { primary: '#28362B', accent: '#D4B886', text: '#F7F4EE' },
  { primary: '#1E242B', accent: '#C5A368', text: '#F7F4EE' },
  { primary: '#3A2316', accent: '#C5A368', text: '#FFF9EB' }
];

export function formatBook(book, index = 0) {
  const palette = book.coverPalette || DEFAULT_PALETTES[index % DEFAULT_PALETTES.length];
  const shelf =
    book.shelfLocation ||
    `Wing ${['A', 'B', 'C', 'D', 'E'][index % 5]} • Bay 0${(index % 4) + 1} • Shelf ${(index % 3) + 1}`;
  const callNum =
    book.callNumber ||
    `${(book.category || 'QA').slice(0, 2).toUpperCase()} ${1500 + index * 42} .A${index + 10} ${
      book.publicationYear || book.year || 2025
    }`;

  return {
    ...book,
    id: book.id,
    title: book.title || 'Untitled Monograph',
    subtitle:
      book.subtitle ||
      book.aiSummary ||
      book.description?.slice(0, 65) ||
      'Curated Colombo Archival Edition',
    author: book.author || 'Chief Archival Curator',
    category: book.category || 'General',
    isbn: book.isbn || `978-955-0234-${String(index + 10).padStart(2, '0')}-0`,
    callNumber: callNum,
    shelfLocation: shelf,
    year: book.publicationYear || book.year || 2025,
    pages: book.pages || 380,
    publisher: book.publisher || 'Ceylon Architectural Press',
    edition: book.edition || 'First Monograph Edition (Folio)',
    rating: book.rating || 4.8,
    totalCopies: Number(book.totalCopies) || 4,
    availableCopies: Number(book.availableCopies ?? book.totalCopies ?? 0),
    featuredIn3D: Boolean(book.featuredIn3D ?? index < 6),
    coverPalette: palette,
    synopsis:
      book.synopsis ||
      book.description ||
      'An authoritative visual and spatial examination preserved in the AuraLib Colombo Sanctuary archives.',
    excerpt:
      book.excerpt ||
      book.description ||
      '“In the quiet colonnades of memory, each volume opens an enduring conversation across centuries.”'
  };
}

const INITIAL_BOOKS_FALLBACK = [
  {
    id: 'bk-01',
    title: 'Tropical Modernism & The Bawa Canopy',
    subtitle: 'Light, Monsoons, and Courtyards in Sri Lankan Architecture',
    author: 'Dr. Anoma Pieris & Channa Daswatte',
    category: 'History',
    isbn: '978-955-0234-81-3',
    callNumber: 'NA 1510.6 .P54 2025',
    shelfLocation: 'Wing A • Bay 02 • Shelf 3',
    year: 2025,
    pages: 412,
    publisher: 'Ceylon Architectural Press',
    edition: 'First Monograph Edition (Folio)',
    rating: 4.9,
    totalCopies: 5,
    availableCopies: 3,
    featuredIn3D: true,
    coverPalette: { primary: '#23392D', accent: '#C5A368', text: '#F7F4EE' },
    synopsis:
      'An authoritative visual and spatial examination of Geoffrey Bawa’s architectural legacy across Lunuganga, Kandalama, and Colombo—exploring how breathable verandas, travertine stone, and monsoon light shaped contemporary tropical modernism.',
    excerpt:
      '“Architecture in the tropics cannot be a sealed glass box; it must be a choreography of shade, rain-water, and cross-ventilation where the garden enters the room without permission.”'
  },
  {
    id: 'bk-02',
    title: 'The Seven Moons of Maali Almeida',
    subtitle: 'A Novel of Memory, Afterlife, and Photographs',
    author: 'Shehan Karunatilaka',
    category: 'Fiction',
    isbn: '978-191-1717-12-6',
    callNumber: 'PR 9440.9 .K37 2022',
    shelfLocation: 'Wing B • Bay 01 • Shelf 2',
    year: 2022,
    pages: 400,
    publisher: 'Sort Of Books / Colombo Collector Imprint',
    edition: 'Booker Prize Archival Hardcover',
    rating: 4.9,
    totalCopies: 6,
    availableCopies: 4,
    featuredIn3D: true,
    coverPalette: { primary: '#3A1E1A', accent: '#D4B886', text: '#FFF9EB' },
    synopsis:
      'Colombo, 1990. War photographer Maali Almeida wakes up dead in what seems to be a celestial visa office. With seven moons to contact the people he loves most and lead them to a hidden cache of photographs, he embarks on an unforgettable odyssey.',
    excerpt:
      '“You wake up with the taste of hibiscus and old flashbulbs in your mouth, holding a numbered token in a corridor that smells suspiciously like the Department of Motor Traffic.”'
  },
  {
    id: 'bk-03',
    title: 'Neural Architectures of Knowledge',
    subtitle: 'Vector Topologies, Semantic Retrieval & Epistemic Systems',
    author: 'Prof. Kasun Ratnayake & Elena Vance',
    category: 'Technology',
    isbn: '978-026-2048-91-0',
    callNumber: 'QA 76.87 .R38 2026',
    shelfLocation: 'Wing C • Bay 04 • Shelf 1',
    year: 2026,
    pages: 528,
    publisher: 'MIT Press / AuraLib Academic',
    edition: '2nd Revised Edition',
    rating: 4.8,
    totalCopies: 4,
    availableCopies: 2,
    featuredIn3D: true,
    coverPalette: { primary: '#1E2936', accent: '#C5A368', text: '#F7F4EE' },
    synopsis:
      'How modern high-dimensional embedding spaces mirror ancient memory palaces. This foundational volume bridges cognitive neuroscience, transformer indexing, and spatial library classification.',
    excerpt:
      '“When Jorge Luis Borges imagined the Library of Babel, he described an unstructured combinatorial infinity; modern semantic manifolds turn that infinity into a navigable geography of meaning.”'
  },
  {
    id: 'bk-04',
    title: 'Hydraulic Civilizations of Rajarata',
    subtitle: 'Ancient Cascade Tank Systems and Precision Engineering',
    author: 'R.L. Brohier & Dr. Nirmal Senanayake',
    category: 'Science',
    isbn: '978-955-5641-19-8',
    callNumber: 'TC 504.8 .B76 2024',
    shelfLocation: 'Wing A • Bay 05 • Shelf 4',
    year: 2024,
    pages: 364,
    publisher: 'National Epigraphy & Science House',
    edition: 'Centenary Annotated Edition',
    rating: 4.9,
    totalCopies: 3,
    availableCopies: 1,
    featuredIn3D: true,
    coverPalette: { primary: '#2B3325', accent: '#C5A368', text: '#F7F4EE' },
    synopsis:
      'A hydro-engineering masterwork analyzing the interconnected Ellanga (cascade tank) ecosystems of Anuradhapura and Polonnaruwa, including micro-gradient laser surveys of the Yoda Ela canal and Biso Kotuwa valve pits.',
    excerpt:
      '“Wait for the surveyor’s level to settle: across seventeen miles of granite terrain, the ancient engineers maintained a drop of barely six inches per mile.”'
  },
  {
    id: 'bk-05',
    title: 'The Quiet Poetics of Space',
    subtitle: 'Phenomenology of Timber, Stone, and Daylight',
    author: 'Juhani Pallasmaa & Mateo Rossi',
    category: 'Education',
    isbn: '978-050-0343-65-4',
    callNumber: 'NA 2500 .P35 2025',
    shelfLocation: 'Wing A • Bay 01 • Shelf 1',
    year: 2025,
    pages: 290,
    publisher: 'Thames & Hudson Architectural',
    edition: 'Linen-Bound Hardcover',
    rating: 4.7,
    totalCopies: 4,
    availableCopies: 4,
    featuredIn3D: true,
    coverPalette: { primary: '#473628', accent: '#D4B886', text: '#FFF9EB' },
    synopsis:
      'Why do certain rooms immediately quiet the human nervous system? An exploration of acoustic warmth, tactile patina in walnut and travertine, and how libraries act as sanctuaries for deep contemplation.',
    excerpt:
      '“Sight isolates, whereas sound and touch incorporate; when sunlight grazes rough-cut stone, we feel the warmth with our skin long before we analyze the geometry.”'
  },
  {
    id: 'bk-06',
    title: 'Maritime Silk & Cinnamon Routes',
    subtitle: 'Indian Ocean Trade Networks and Monetary History (1200–1800)',
    author: 'Dr. Sujit Sivasundaram',
    category: 'Business',
    isbn: '978-110-8492-31-7',
    callNumber: 'HF 3770.8 .S58 2024',
    shelfLocation: 'Wing D • Bay 02 • Shelf 3',
    year: 2024,
    pages: 446,
    publisher: 'Cambridge Maritime Press',
    edition: '1st Hardcover Edition',
    rating: 4.8,
    totalCopies: 3,
    availableCopies: 0,
    featuredIn3D: true,
    coverPalette: { primary: '#231710', accent: '#C5A368', text: '#F7F4EE' },
    synopsis:
      'Tracing how port cities from Galle and Beruwala to Malacca and Calicut pioneered early maritime credit instruments, spice futures, and cross-cultural mercantile law.',
    excerpt:
      '“Before European charter companies arrived, the monsoon winds themselves functioned as the clearinghouse calendar of the Indian Ocean world.”'
  }
].map((b, i) => formatBook(b, i));

const STUDY_PODS_INITIAL = [
  {
    id: 'pod-01',
    name: 'Atrium Glass Sanctuary 01',
    zone: 'East Sunlit Colonnade • Level 2',
    capacity: '1–2 Scholars',
    features: ['Natural Skylight', 'Walnut Desk + Brass Lamp', 'Acoustic Glass'],
    status: 'Available'
  },
  {
    id: 'pod-02',
    name: 'Bawa Courtyard Reading Alcove',
    zone: 'West Reflection Garden • Level 1',
    capacity: '1–4 Scholars',
    features: ['Garden View', '4K Archival Light Table', 'Power & Ethernet'],
    status: 'Available'
  },
  {
    id: 'pod-03',
    name: 'Rare Manuscript Whispering Pod',
    zone: 'North Vault Gallery • Level 3',
    capacity: '1 Scholar',
    features: ['Humidity Controlled', 'Book Cradle', 'Zero-Glare Illumination'],
    status: 'Occupied until 16:30'
  }
];

const SCENE_CHAPTERS = [
  {
    index: 0,
    id: 'scene-entrance',
    range: [0, 0.16],
    targetScroll: 0.02,
    code: '01',
    label: 'The Entrance',
    subtitle: 'Grand Colonnade Arrival',
    cameraPos: [0, 3.2, 23.5],
    lookAt: [0, 3.1, 0]
  },
  {
    index: 1,
    id: 'scene-aisle',
    range: [0.16, 0.33],
    targetScroll: 0.24,
    code: '02',
    label: 'Grand Bookshelf',
    subtitle: '48,920+ Curated Volumes',
    cameraPos: [0, 2.9, 13.5],
    lookAt: [0, 3.3, -6]
  },
  {
    index: 2,
    id: 'scene-discover',
    range: [0.33, 0.5],
    targetScroll: 0.41,
    code: '03',
    label: 'Discover Collection',
    subtitle: 'Interactive 3D Shelf Bay',
    cameraPos: [-2.1, 2.65, 4.8],
    lookAt: [-5.8, 2.75, 1.5]
  },
  {
    index: 3,
    id: 'scene-lounge',
    range: [0.5, 0.67],
    targetScroll: 0.58,
    code: '04',
    label: 'Reading Lounge',
    subtitle: 'Sunlit Travertine Tables',
    cameraPos: [1.8, 2.35, -2.5],
    lookAt: [0, 1.5, -8.5]
  },
  {
    index: 4,
    id: 'scene-smart',
    range: [0.67, 0.84],
    targetScroll: 0.75,
    code: '05',
    label: 'Smart Workspace',
    subtitle: 'Telemetry & Pod Booking',
    cameraPos: [-1.6, 2.5, -9.2],
    lookAt: [3.2, 2.1, -13.5]
  },
  {
    index: 5,
    id: 'scene-reveal',
    range: [0.84, 1.0],
    targetScroll: 0.94,
    code: '06',
    label: 'The Final Reveal',
    subtitle: 'The Sunlit Sanctuary',
    cameraPos: [0, 3.8, -15.5],
    lookAt: [0, 4.2, -28]
  }
];

// ============================================================================
// 4. WEB AUDIO API — SYNTHESIZED AMBIENT LIBRARY SOUNDSCAPE
// ============================================================================
class LibraryAmbientAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  start() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.055, this.ctx.currentTime + 2.0);
      this.masterGain.connect(this.ctx.destination);

      // Warm F-major 9th architectural room chord (very subtle sine pads)
      const freqs = [174.61, 220.0, 261.63, 329.63, 392.0];
      this.oscillators = freqs.map((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.15 / freqs.length, this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        return osc;
      });

      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio API could not initialize:', e);
    }
  }

  stop() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try {
            osc.stop();
          } catch (_) {}
        });
        this.oscillators = [];
      }, 650);
      this.isPlaying = false;
    } catch (_) {}
  }
}

const ambientAudioInstance = new LibraryAmbientAudio();

// ============================================================================
// 5. CUSTOM AURALIB LK ARCHITECTURAL LOGO
// ============================================================================
export const AuraLibLogo = ({ className = 'w-9 h-9', light = false }) => (
  <div className="flex items-center gap-3 select-none group">
    <img
      src={logoImg}
      alt="AuraLib LK Logo"
      className={`${className} rounded-xl object-contain shadow-sm border border-[#C5A368]/30 bg-white group-hover:scale-105 transition-transform shrink-0 p-0.5`}
    />
    <div className="flex flex-col text-left">
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-editorial text-2xl font-semibold tracking-tight leading-none ${
            light ? 'text-[#F7F4EE]' : 'text-[#231710]'
          }`}
        >
          AuraLib
        </span>
        <span className="font-mono-code text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#C5A368]/20 text-[#9B783E] font-medium">
          LK
        </span>
      </div>
      <span
        className={`text-[10px] tracking-[0.18em] uppercase font-sans-ui mt-0.5 ${
          light ? 'text-[#D4B886]' : 'text-[#6E5A4F]'
        }`}
      >
        Colombo Smart Sanctuary
      </span>
    </div>
  </div>
);

// ============================================================================
// 6. THREE.JS 3D ARCHITECTURAL LIBRARY CANVAS
// ============================================================================
const ArchitecturalLibraryCanvas = ({
  scrollProgress,
  books,
  onSelectBook,
  hoveredBook3D,
  setHoveredBook3D,
  reducedMotion,
  highQuality,
  onLoaded
}) => {
  const mountRef = useRef(null);
  const scrollRef = useRef(scrollProgress);
  const pointerRef = useRef({ x: 0, y: 0 });
  const reducedMotionRef = useRef(reducedMotion);
  const onSelectBookRef = useRef(onSelectBook);
  const setHoveredBookRef = useRef(setHoveredBook3D);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    onSelectBookRef.current = onSelectBook;
    setHoveredBookRef.current = setHoveredBook3D;
  }, [onSelectBook, setHoveredBook3D]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Initialize Scene, Fog & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F3EFE6');
    scene.fog = new THREE.FogExp2('#F3EFE6', 0.018);

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 3.2, 23.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: highQuality,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, highQuality ? 2 : 1.25));
      renderer.shadowMap.enabled = highQuality;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.error('WebGL initialization fallback:', err);
      if (onLoaded) onLoaded(false);
      return;
    }

    // 2. Lighting
    const hemiLight = new THREE.HemisphereLight('#FFFDF7', '#B9A68E', 1.35);
    hemiLight.position.set(0, 18, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FFF5DC', 2.4);
    sunLight.position.set(16, 26, 12);
    sunLight.castShadow = highQuality;
    if (highQuality) {
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 70;
      const d = 28;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    const warmPointPositions = [
      [0, 7.5, 14],
      [0, 7.5, 2],
      [0, 7.5, -10],
      [0, 8.5, -22]
    ];
    warmPointPositions.forEach(([x, y, z]) => {
      const pLight = new THREE.PointLight('#FFE3B3', 1.6, 22, 1.5);
      pLight.position.set(x, y, z);
      scene.add(pLight);
    });

    // 3. Materials
    const woodTex = createWoodTexture();
    const travertineTex = createTravertineTexture();

    const walnutMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.42,
      metalness: 0.08
    });

    const espressoMat = new THREE.MeshStandardMaterial({
      color: '#231710',
      roughness: 0.38,
      metalness: 0.1
    });

    const travertineFloorMat = new THREE.MeshStandardMaterial({
      map: travertineTex,
      roughness: 0.22,
      metalness: 0.06
    });

    const limestoneWallMat = new THREE.MeshStandardMaterial({
      color: '#EFEBE1',
      roughness: 0.72,
      metalness: 0.02
    });

    const champagneGoldMat = new THREE.MeshStandardMaterial({
      color: '#C5A368',
      roughness: 0.26,
      metalness: 0.82
    });

    const foliageMat = new THREE.MeshStandardMaterial({
      color: '#264635',
      roughness: 0.65
    });

    // 4. Floor
    const floorGeo = new THREE.PlaneGeometry(36, 75);
    const floorMesh = new THREE.Mesh(floorGeo, travertineFloorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, -4);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const inlayGeo = new THREE.PlaneGeometry(0.08, 62);
    const leftInlay = new THREE.Mesh(inlayGeo, champagneGoldMat);
    leftInlay.rotation.x = -Math.PI / 2;
    leftInlay.position.set(-3.4, 0.005, -3);
    scene.add(leftInlay);

    const rightInlay = new THREE.Mesh(inlayGeo, champagneGoldMat);
    rightInlay.rotation.x = -Math.PI / 2;
    rightInlay.position.set(3.4, 0.005, -3);
    scene.add(rightInlay);

    // 5. Ceiling Beams
    const ceilingGroup = new THREE.Group();
    for (let z = 24; z >= -34; z -= 6) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(26, 0.55, 0.7), limestoneWallMat);
      beam.position.set(0, 10.6, z);
      ceilingGroup.add(beam);

      const skylight = new THREE.Mesh(
        new THREE.PlaneGeometry(8.5, 4.6),
        new THREE.MeshBasicMaterial({ color: '#FFFDF6' })
      );
      skylight.rotation.x = Math.PI / 2;
      skylight.position.set(0, 10.95, z - 3);
      ceilingGroup.add(skylight);
    }
    scene.add(ceilingGroup);

    // 6. Walnut Bookshelf Bays
    const shelfBaysGroup = new THREE.Group();
    const bayZPositions = [18, 12, 6, 0, -6, -12];

    bayZPositions.forEach((zPos) => {
      [-1, 1].forEach((side) => {
        const bayGroup = new THREE.Group();
        const xPos = side * 6.4;
        bayGroup.position.set(xPos, 0, zPos);

        const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.25, 8.6, 4.6), walnutMat);
        backPanel.position.set(side * 0.45, 4.3, 0);
        backPanel.castShadow = true;
        backPanel.receiveShadow = true;
        bayGroup.add(backPanel);

        [-2.2, 2.2].forEach((zOffset) => {
          const pilaster = new THREE.Mesh(new THREE.BoxGeometry(1.1, 8.8, 0.38), walnutMat);
          pilaster.position.set(0, 4.4, zOffset);
          pilaster.castShadow = true;
          bayGroup.add(pilaster);

          const cap = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.12, 0.44), champagneGoldMat);
          cap.position.set(0, 8.2, zOffset);
          bayGroup.add(cap);
        });

        for (let s = 0; s < 7; s++) {
          const shelfY = 0.45 + s * 1.18;
          const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.09, 4.2), walnutMat);
          shelfBoard.position.set(0, shelfY, 0);
          shelfBoard.receiveShadow = true;
          bayGroup.add(shelfBoard);

          if (s === 2 || s === 4) {
            const brassTrim = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 4.1), champagneGoldMat);
            brassTrim.position.set(-side * 0.47, shelfY, 0);
            bayGroup.add(brassTrim);
          }
        }

        const railBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 5.8, 12), champagneGoldMat);
        railBar.rotation.x = Math.PI / 2;
        railBar.position.set(-side * 1.15, 5.2, 0);
        bayGroup.add(railBar);

        shelfBaysGroup.add(bayGroup);
      });
    });
    scene.add(shelfBaysGroup);

    // 7. Instanced Background Books
    const bookColors = [
      '#2E1F18',
      '#3F2A1D',
      '#21382B',
      '#4A3223',
      '#1F2B37',
      '#5C3A28',
      '#2B2623',
      '#6E4E32',
      '#C5A368',
      '#D6CEBF'
    ];
    const unitBookGeo = new THREE.BoxGeometry(0.62, 0.82, 0.14);
    const instancedBookMat = new THREE.MeshStandardMaterial({
      roughness: 0.55,
      metalness: 0.08
    });

    const totalInstances = 880;
    const instancedBooks = new THREE.InstancedMesh(unitBookGeo, instancedBookMat, totalInstances);
    instancedBooks.castShadow = highQuality;
    instancedBooks.receiveShadow = highQuality;

    const dummy = new THREE.Object3D();
    const colorObj = new THREE.Color();
    let instanceIdx = 0;

    bayZPositions.forEach((zPos) => {
      [-1, 1].forEach((side) => {
        const baseX = side * 6.25;
        for (let s = 0; s < 6; s++) {
          const shelfSurfaceY = 0.5 + s * 1.18;
          let cursorZ = zPos - 1.85;
          while (cursorZ < zPos + 1.75 && instanceIdx < totalInstances) {
            if (Math.random() < 0.14) {
              cursorZ += 0.35;
              continue;
            }
            const heightScale = 0.78 + Math.random() * 0.34;
            const thickScale = 0.75 + Math.random() * 0.85;
            const bookHeight = 0.82 * heightScale;
            const bookThick = 0.14 * thickScale;

            dummy.position.set(baseX - side * (Math.random() * 0.06), shelfSurfaceY + bookHeight / 2, cursorZ);
            dummy.scale.set(1, heightScale, thickScale);
            dummy.rotation.set((Math.random() - 0.5) * 0.06, 0, 0);
            dummy.updateMatrix();
            instancedBooks.setMatrixAt(instanceIdx, dummy.matrix);

            const pickedHex = bookColors[instanceIdx % bookColors.length];
            colorObj.set(pickedHex);
            instancedBooks.setColorAt(instanceIdx, colorObj);

            instanceIdx++;
            cursorZ += bookThick + 0.025;
          }
        }
      });
    });
    instancedBooks.instanceMatrix.needsUpdate = true;
    if (instancedBooks.instanceColor) instancedBooks.instanceColor.needsUpdate = true;
    scene.add(instancedBooks);

    // 8. Interactive Featured 3D Books
    const interactiveBookMeshes = [];
    const featuredBooks = books.slice(0, 6);

    featuredBooks.forEach((book, idx) => {
      const holder = new THREE.Group();
      const isPedestalBook = idx >= 4;
      if (!isPedestalBook) {
        const row = idx % 2;
        const col = Math.floor(idx / 2);
        holder.position.set(-5.65, 1.98 + row * 1.18, 5.2 - col * 2.1);
        holder.rotation.y = Math.PI / 2 - 0.25;
      } else {
        const offset = idx === 4 ? -0.9 : 0.9;
        holder.position.set(offset, 1.32, -6.5);
        holder.rotation.set(-0.35, idx === 4 ? 0.3 : -0.3, 0);
      }

      const coverDataUrl = generateBookCoverDataURL(book);
      const coverTexture = new THREE.TextureLoader().load(coverDataUrl);
      coverTexture.colorSpace = THREE.SRGBColorSpace;

      const coverMat = new THREE.MeshStandardMaterial({
        map: coverTexture,
        roughness: 0.35,
        metalness: 0.1
      });
      const pagesMat = new THREE.MeshStandardMaterial({
        color: '#F6F1E4',
        roughness: 0.8
      });
      const spineMat = new THREE.MeshStandardMaterial({
        color: book.coverPalette?.primary || '#231710',
        roughness: 0.4
      });

      const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.02, 0.16), [
        pagesMat,
        spineMat,
        pagesMat,
        pagesMat,
        coverMat,
        spineMat
      ]);
      bookMesh.castShadow = true;
      bookMesh.userData = { book, basePos: holder.position.clone() };

      const haloGeo = new THREE.RingGeometry(0.42, 0.48, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: '#C5A368',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = -Math.PI / 2;
      haloMesh.position.y = -0.52;
      holder.add(haloMesh);

      holder.add(bookMesh);
      scene.add(holder);
      interactiveBookMeshes.push(bookMesh);
    });

    // 9. Reading Lounge Tables & Kiosk
    const createReadingTable = (x, z) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(x, 0, z);

      const top = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.8), walnutMat);
      top.position.y = 1.05;
      top.castShadow = true;
      top.receiveShadow = true;
      tableGroup.add(top);

      [-1.3, 1.3].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.05, 1.4), espressoMat);
        leg.position.set(lx, 0.525, 0);
        tableGroup.add(leg);
      });

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.06, 20), champagneGoldMat);
      lampBase.position.set(0, 1.14, 0);
      tableGroup.add(lampBase);

      const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.58, 12), champagneGoldMat);
      lampStem.position.set(0, 1.42, 0);
      tableGroup.add(lampStem);

      const lampShade = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 0.22, 24, 1, true),
        new THREE.MeshStandardMaterial({
          color: '#234233',
          roughness: 0.25,
          metalness: 0.2,
          side: THREE.DoubleSide
        })
      );
      lampShade.position.set(0, 1.68, 0);
      tableGroup.add(lampShade);

      return tableGroup;
    };

    scene.add(createReadingTable(0, -6.5));
    scene.add(createReadingTable(-2.8, -14.5));
    scene.add(createReadingTable(2.8, -14.5));

    // Smart Workspace Kiosk Station
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(2.6, 0, -11.2);
    kioskGroup.rotation.y = -0.45;
    const kioskPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.25, 0.55), espressoMat);
    kioskPedestal.position.y = 0.625;
    kioskGroup.add(kioskPedestal);

    const kioskScreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.72, 0.06),
      new THREE.MeshBasicMaterial({ color: '#F7F4EE' })
    );
    kioskScreen.position.set(0, 1.42, 0.08);
    kioskScreen.rotation.x = -0.35;
    kioskGroup.add(kioskScreen);

    const kioskRim = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.78, 0.04), champagneGoldMat);
    kioskRim.position.set(0, 1.41, 0.06);
    kioskRim.rotation.x = -0.35;
    kioskGroup.add(kioskRim);
    scene.add(kioskGroup);

    // 10. Atrium Archway & Tropical Planters
    const atriumGroup = new THREE.Group();
    atriumGroup.position.set(0, 0, -25);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(26, 12, 0.8), limestoneWallMat);
    backWall.position.set(0, 6, -4);
    atriumGroup.add(backWall);

    [-6, 0, 6].forEach((wx) => {
      const windowPane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.8, 8.8),
        new THREE.MeshBasicMaterial({ color: '#FFFDF4' })
      );
      windowPane.position.set(wx, 5.2, -3.55);
      atriumGroup.add(windowPane);

      const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(4.0, 9.0, 0.15), champagneGoldMat);
      windowFrame.position.set(wx, 5.2, -3.58);
      atriumGroup.add(windowFrame);
    });

    [-4.2, 4.2].forEach((px) => {
      const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.7, 0.9, 24), limestoneWallMat);
      planter.position.set(px, 0.45, 2.5);
      atriumGroup.add(planter);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 2.4, 10), walnutMat);
      trunk.position.set(px, 1.8, 2.5);
      atriumGroup.add(trunk);

      const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 1), foliageMat);
      canopy1.position.set(px, 3.1, 2.5);
      atriumGroup.add(canopy1);

      const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), foliageMat);
      canopy2.position.set(px + 0.45, 3.6, 2.2);
      atriumGroup.add(canopy2);
    });

    scene.add(atriumGroup);

    // 11. Volumetric God-Rays & Floating Dust Motes
    const lightRayMat = new THREE.MeshBasicMaterial({
      color: '#FFF6DC',
      transparent: true,
      opacity: 0.075,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const rayZPositions = [15, 5, -5, -16];
    rayZPositions.forEach((rz) => {
      const rayGeo = new THREE.ConeGeometry(3.8, 12.5, 24, 1, true);
      const rayMesh = new THREE.Mesh(rayGeo, lightRayMat);
      rayMesh.position.set(1.2, 5.8, rz);
      rayMesh.rotation.z = -0.32;
      rayMesh.rotation.x = 0.08;
      scene.add(rayMesh);
    });

    const particleCount = highQuality ? 320 : 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = 0.8 + Math.random() * 8.5;
      positions[i * 3 + 2] = 22 - Math.random() * 46;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#FFE8B8',
      size: 0.085,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(dustParticles);

    // 12. Raycaster for Interactive Books
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2(-999, -999);

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerRef.current = { x: nx, y: ny };
      mouseVec.set(nx, ny);

      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(interactiveBookMeshes, false);
      if (hits.length > 0) {
        const hitBook = hits[0].object.userData.book;
        renderer.domElement.style.cursor = 'pointer';
        if (setHoveredBookRef.current) setHoveredBookRef.current(hitBook);
      } else {
        renderer.domElement.style.cursor = 'default';
        if (setHoveredBookRef.current) setHoveredBookRef.current(null);
      }
    };

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(interactiveBookMeshes, false);
      if (hits.length > 0 && onSelectBookRef.current) {
        onSelectBookRef.current(hits[0].object.userData.book);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    renderer.domElement.addEventListener('click', handleClick);

    // 13. Camera Waypoint Animation Loop
    const currentCamPos = new THREE.Vector3(0, 3.2, 23.5);
    const currentLookAt = new THREE.Vector3(0, 3.1, 0);
    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();

    const getInterpolatedCameraState = (t) => {
      const clampedT = Math.max(0, Math.min(1, t));
      const scaled = clampedT * (SCENE_CHAPTERS.length - 1);
      const idx = Math.min(Math.floor(scaled), SCENE_CHAPTERS.length - 2);
      const localAlpha = scaled - idx;
      const smoothAlpha = localAlpha * localAlpha * (3 - 2 * localAlpha);

      const cA = SCENE_CHAPTERS[idx];
      const cB = SCENE_CHAPTERS[idx + 1];

      targetCamPos.set(
        THREE.MathUtils.lerp(cA.cameraPos[0], cB.cameraPos[0], smoothAlpha),
        THREE.MathUtils.lerp(cA.cameraPos[1], cB.cameraPos[1], smoothAlpha),
        THREE.MathUtils.lerp(cA.cameraPos[2], cB.cameraPos[2], smoothAlpha)
      );

      targetLookAt.set(
        THREE.MathUtils.lerp(cA.lookAt[0], cB.lookAt[0], smoothAlpha),
        THREE.MathUtils.lerp(cA.lookAt[1], cB.lookAt[1], smoothAlpha),
        THREE.MathUtils.lerp(cA.lookAt[2], cB.lookAt[2], smoothAlpha)
      );
    };

    let animFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      getInterpolatedCameraState(scrollRef.current);

      if (!reducedMotionRef.current) {
        targetCamPos.x += pointerRef.current.x * 0.35;
        targetCamPos.y += pointerRef.current.y * 0.2;
      }

      const damping = reducedMotionRef.current ? 0.18 : 0.065;
      currentCamPos.lerp(targetCamPos, damping);
      currentLookAt.lerp(targetLookAt, damping);

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      interactiveBookMeshes.forEach((mesh, i) => {
        mesh.position.y = Math.sin(elapsed * 2.1 + i) * 0.04;
      });

      if (!reducedMotionRef.current) {
        dustParticles.rotation.y = elapsed * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();
    if (onLoaded) onLoaded(true);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('click', handleClick);
        renderer.dispose();
      }
    };
  }, [highQuality, books]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-auto"
      aria-label="Interactive 3D Architectural Library Environment"
    />
  );
};

// ============================================================================
// 7. BOOK DETAIL & 3D COVER INSPECTION MODAL
// ============================================================================
const BookDetailModal = ({ book, onClose, onReserveBook, onToggleSaved, isSaved, currentUser }) => {
  const [tilt, setTilt] = useState({ rx: 0, ry: -16 });
  const [showExcerpt, setShowExcerpt] = useState(false);

  if (!book) return null;

  const coverUrl = generateBookCoverDataURL(book);
  const isAvailable = Number(book.availableCopies) > 0;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 34;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -24;
    setTilt({ rx: y, ry: x });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#231710]/65 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl rounded-2xl arch-glass bg-[#F7F4EE] border border-[#C5A368]/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#231710]/10 hover:bg-[#231710] text-[#231710] hover:text-[#F7F4EE] transition-colors"
          aria-label="Close Book Details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Book Mockup Column */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ rx: 4, ry: -18 })}
          className="w-full md:w-2/5 bg-gradient-to-br from-[#EFECE6] via-[#E4DEC8] to-[#D9D0B8] p-8 flex flex-col items-center justify-center relative select-none cursor-grab active:cursor-grabbing border-b md:border-b-0 md:border-r border-[#C5A368]/30"
        >
          <div className="text-[11px] font-mono-code uppercase tracking-widest text-[#6E5A4F] mb-4 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-[#C5A368]" />
            Move Pointer to Inspect 3D Volume
          </div>

          <div className="perspective-1000 my-2">
            <div
              className="relative w-48 h-72 transition-transform duration-150 ease-out preserve-3d shadow-2xl"
              style={{
                transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
              }}
            >
              <img
                src={coverUrl}
                alt={book.title}
                className="w-full h-full object-cover rounded-r-md shadow-xl border border-[#C5A368]/40"
              />
              <div
                className="absolute top-0 left-0 w-7 h-full origin-left flex items-center justify-center"
                style={{
                  backgroundColor: book.coverPalette?.primary || '#231710',
                  transform: 'rotateY(-90deg) translateX(-14px)',
                  borderLeft: '2px solid #C5A368'
                }}
              >
                <span className="font-mono-code text-[9px] text-[#D4B886] tracking-widest whitespace-nowrap -rotate-90">
                  {book.callNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#231710]/5 border border-[#C5A368]/30 text-xs font-mono-code text-[#3A261A]">
              <MapPin className="w-3.5 h-3.5 text-[#C5A368]" />
              {book.shelfLocation}
            </div>
            <p className="text-xs text-[#6E5A4F] font-mono-code">Call No: {book.callNumber}</p>
          </div>
        </div>

        {/* Editorial Details Column */}
        <div className="w-full md:w-3/5 p-6 sm:p-8 overflow-y-auto space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider bg-[#C5A368]/20 text-[#3A261A]">
              {book.category}
            </span>
            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#234233]/15 text-[#234233]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Available on Shelf ({book.availableCopies} of {book.totalCopies} copies)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-900/15 text-amber-900">
                <Clock className="w-3.5 h-3.5" />
                All Copies Checked Out • Waitlist Open
              </span>
            )}
          </div>

          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#231710] leading-tight">
              {book.title}
            </h2>
            <p className="font-editorial italic text-lg text-[#6E5A4F] mt-1">{book.subtitle}</p>
            <p className="text-sm font-medium text-[#3A261A] mt-2">
              By <span className="underline decoration-[#C5A368]">{book.author}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#EFECE6] border border-[#C5A368]/25 space-y-2">
            <div className="flex items-center justify-between border-b border-[#C5A368]/20 pb-2">
              <span className="text-xs font-mono-code uppercase tracking-wider text-[#6E5A4F]">
                {showExcerpt ? 'Opening Manuscript Excerpt' : 'Curatorial Synopsis'}
              </span>
              <button
                onClick={() => setShowExcerpt(!showExcerpt)}
                className="text-xs font-medium text-[#234233] hover:underline flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showExcerpt ? 'View Synopsis' : 'Read Excerpt Preview'}
              </button>
            </div>
            {showExcerpt ? (
              <blockquote className="font-editorial italic text-lg text-[#231710] leading-relaxed py-1">
                {book.excerpt}
              </blockquote>
            ) : (
              <p className="text-sm text-[#3A261A] leading-relaxed">{book.synopsis}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-y border-[#C5A368]/25 py-4">
            <div>
              <span className="text-[#6E5A4F] block">ISBN-13</span>
              <span className="font-mono-code font-medium text-[#231710]">{book.isbn}</span>
            </div>
            <div>
              <span className="text-[#6E5A4F] block">Publisher</span>
              <span className="font-medium text-[#231710]">{book.publisher}</span>
            </div>
            <div>
              <span className="text-[#6E5A4F] block">Format / Pages</span>
              <span className="font-medium text-[#231710]">
                {book.pages} pp • {book.year}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onReserveBook(book)}
              className="flex-1 min-w-[200px] py-3.5 px-6 rounded-xl bg-[#231710] hover:bg-[#3A261A] text-[#F7F4EE] font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <BookMarked className="w-4 h-4 text-[#C5A368]" />
              {isAvailable
                ? currentUser
                  ? 'Reserve Book'
                  : 'Login to Reserve'
                : 'Join Priority Waitlist'}
            </button>

            <button
              onClick={() => onToggleSaved(book.id)}
              className={`px-4 py-3.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-colors ${
                isSaved
                  ? 'bg-[#234233] text-[#F7F4EE] border-[#234233]'
                  : 'border-[#C5A368]/50 text-[#231710] hover:bg-[#EFECE6]'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  Added to List
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Add to List
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. SCHOLAR SIGN-IN & REGISTRATION MODAL (CONNECTED TO FIREBASE AUTH & BACKEND)
// ============================================================================
const AuthModal = ({ isOpen, onClose, onAuthSuccess, pendingActionLabel, initialMode = 'signin' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleDemoScholarLogin = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const profile = await login({ email: 'kavindi.perera@auralib.lk', password: 'Scholar@123' });
      onAuthSuccess(profile);
    } catch (err) {
      setErrorMsg(err.message || 'Member sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const profile = await login({ email: 'admin@auralib.lk', password: 'Admin@123' });
      onAuthSuccess(profile);
    } catch (err) {
      setErrorMsg(err.message || 'Demo admin sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      let profile;
      if (mode === 'signin') {
        profile = await login({ email: email.trim(), password: password.trim() });
      } else {
        profile = await register({
          name: name.trim() || email.split('@')[0],
          email: email.trim(),
          password: password.trim()
        });
      }
      onAuthSuccess(profile);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231710]/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl arch-glass bg-[#F7F4EE] p-6 sm:p-8 border border-[#C5A368]/40 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#231710]/10 text-[#231710]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-3.5">
            <img
              src={logoImg}
              alt="AuraLib LK Logo"
              className="w-12 h-12 rounded-xl object-contain bg-white border border-[#C5A368]/40 shadow-sm p-1 shrink-0"
            />
            <div>
              <span className="text-xs font-mono-code uppercase tracking-widest text-[#9B783E]">
                AuraLib LK Member Portal
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#231710] mt-0.5">
                {mode === 'signin' ? 'Member Sign In' : 'Apply for Member Card'}
              </h3>
            </div>
          </div>
          {pendingActionLabel && (
            <p className="mt-2 text-xs px-3 py-2 rounded-lg bg-[#C5A368]/15 border border-[#C5A368]/30 text-[#3A261A]">
              Authentication required to complete: <strong>{pendingActionLabel}</strong>
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 text-xs p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
            {errorMsg}
          </div>
        )}

        {/* 1-Click Instant Demo Access Options */}
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-[#231710] to-[#3A261A] text-[#F7F4EE] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-code uppercase tracking-widest text-[#D4B886]">
              Instant Evaluation Access
            </span>
            <ShieldCheck className="w-4 h-4 text-[#C5A368]" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={submitting}
              onClick={handleDemoScholarLogin}
              className="py-2 px-3 rounded-lg bg-[#C5A368] hover:bg-[#D4B886] text-[#231710] font-semibold text-[11px] uppercase tracking-wider transition-colors text-center disabled:opacity-50"
            >
              Member
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDemoAdminLogin}
              className="py-2 px-3 rounded-lg bg-[#234233] hover:bg-[#2d5440] text-[#F7F4EE] font-semibold text-[11px] uppercase tracking-wider transition-colors text-center disabled:opacity-50 border border-[#C5A368]/40"
            >
              Library / Admin
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#C5A368]/30"></div>
          <span className="flex-shrink mx-3 text-xs text-[#6E5A4F] uppercase font-mono-code">
            Or enter credentials
          </span>
          <div className="flex-grow border-t border-[#C5A368]/30"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#3A261A] mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Rohan Wijesinghe"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#C5A368]/40 text-sm focus:outline-none focus:border-[#231710]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#3A261A] mb-1">
              Institutional or Personal Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@auralib.lk"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#C5A368]/40 text-sm focus:outline-none focus:border-[#231710]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3A261A] mb-1">
              Library Card Passcode / Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#C5A368]/40 text-sm focus:outline-none focus:border-[#231710]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#231710] hover:bg-[#3A261A] text-[#F7F4EE] text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submitting
              ? 'Verifying with Archive...'
              : mode === 'signin'
              ? 'Authenticate & Continue'
              : 'Issue Digital Reader Card'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'register' : 'signin');
              setErrorMsg('');
            }}
            className="text-xs text-[#6E5A4F] hover:text-[#231710] underline"
          >
            {mode === 'signin'
              ? 'New to AuraLib LK? Register for a Member Card'
              : 'Already hold a Member Card? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 9. MAIN AURALIB LK ARCHITECTURAL APPLICATION
// ============================================================================
export default function AuraLibMain({ initialTab = 'journey', openAuth = null, openBookId = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Context Hooks
  const { user, isAuthenticated, isAdmin, logout, getToken } = useAuth();
  const {
    books: backendBooks,
    borrowings,
    loading: libraryLoading,
    requestBorrow,
    renewBook,
    returnBook,
    cancelRequest
  } = useLibrary();

  // Navigation & Active View State ('journey' | 'catalogue' | 'categories' | 'mylibrary' | 'recommendations' | 'about')
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronize Tab with Props or URL
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // 3D Scroll Journey State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [webglReady, setWebglReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(25);
  const [hoveredBook3D, setHoveredBook3D] = useState(null);

  // Accessibility & Quality Settings
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Functional Books Catalog
  const formattedBooks = useMemo(() => {
    if (backendBooks && backendBooks.length > 0) {
      return backendBooks.map((b, i) => formatBook(b, i));
    }
    return INITIAL_BOOKS_FALLBACK;
  }, [backendBooks]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Selected Book & Modals
  const [inspectedBook, setInspectedBook] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(Boolean(openAuth));
  const [authMode, setAuthMode] = useState(openAuth || 'signin');
  const [pendingBookToReserve, setPendingBookToReserve] = useState(null);

  // Saved Reading List (Persisted in localStorage)
  const [savedBookIds, setSavedBookIds] = useState(() => {
    try {
      const stored = localStorage.getItem('auralib_saved_books');
      return stored ? JSON.parse(stored) : ['bk-01', 'bk-03'];
    } catch (_) {
      return ['bk-01', 'bk-03'];
    }
  });

  const [studyPods, setStudyPods] = useState(STUDY_PODS_INITIAL);
  const [toastMessage, setToastMessage] = useState(null);

  // Recommendations state
  const [recommendationInterests, setRecommendationInterests] = useState('Tropical Architecture, Vector Systems, Hydraulic Civilizations');
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // If URL has /books/:id, open inspected book
  useEffect(() => {
    const targetId = openBookId || params.id;
    if (targetId && formattedBooks.length > 0) {
      const found = formattedBooks.find((b) => b.id === targetId);
      if (found) setInspectedBook(found);
    }
  }, [openBookId, params.id, formattedBooks]);

  // Loading progress animation
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setReducedMotion(true);

    const timer = setInterval(() => {
      setLoadingProgress((prev) => (prev >= 100 ? 100 : prev + 25));
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // Scroll listener for 3D Colonnade Journey
  useEffect(() => {
    if (activeTab !== 'journey') return;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = Math.max(0, Math.min(1, window.scrollY / docHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  }, []);

  // Determine current active 3D scene chapter (0..5)
  const activeChapterIndex = useMemo(() => {
    for (let i = 0; i < SCENE_CHAPTERS.length; i++) {
      const [start, end] = SCENE_CHAPTERS[i].range;
      if (scrollProgress >= start && scrollProgress <= end) return i;
    }
    return SCENE_CHAPTERS.length - 1;
  }, [scrollProgress]);

  const scrollToChapter = (chapterIndex) => {
    const chapter = SCENE_CHAPTERS[chapterIndex];
    if (!chapter) return;
    if (activeTab !== 'journey') {
      setActiveTab('journey');
      navigate('/');
      setTimeout(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({
          top: chapter.targetScroll * docHeight,
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      }, 60);
    } else {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: chapter.targetScroll * docHeight,
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    }
  };

  const handleToggleAudio = () => {
    const playing = ambientAudioInstance.toggle();
    setAudioPlaying(playing);
    triggerToast(
      playing
        ? 'Ambient Library Acoustics Enabled (Warm Room Tone)'
        : 'Ambient Library Audio Muted'
    );
  };

  const handleToggleSaved = useCallback(
    (bookId) => {
      setSavedBookIds((prev) => {
        const exists = prev.includes(bookId);
        const updated = exists ? prev.filter((id) => id !== bookId) : [...prev, bookId];
        try {
          localStorage.setItem('auralib_saved_books', JSON.stringify(updated));
        } catch (_) {}
        triggerToast(
          exists ? 'Removed from your List' : 'Added to List'
        );
        return updated;
      });
    },
    [triggerToast]
  );

  // Honest Reservation connected to Backend FastAPI & Cloud Firestore
  const executeReservation = useCallback(
    async (book, userObj) => {
      const alreadyReserved = borrowings.some(
        (r) => r.bookId === book.id && r.memberId === userObj.id && (r.status === 'pending' || r.status === 'approved')
      );
      if (alreadyReserved) {
        triggerToast(`You already hold an active reservation or loan for “${book.title}”.`);
        return;
      }

      const res = await requestBorrow(book.id, 'Reserved via AuraLib 3D WebGL Colonnade');
      if (res.success) {
        const ticketCode = `AL-PK-${Math.floor(100000 + Math.random() * 900000)}`;
        setInspectedBook(null);
        triggerToast(
          book.availableCopies > 0
            ? `Reservation Confirmed (${ticketCode}) — Ready for Pickup at ${book.shelfLocation}`
            : `Waitlist Hold Recorded (${ticketCode}) for “${book.title}”`
        );
      } else {
        triggerToast(res.reason || 'Could not complete reservation request.');
      }
    },
    [borrowings, requestBorrow, triggerToast]
  );

  const handleReserveBook = useCallback(
    (book) => {
      if (!isAuthenticated || !user) {
        setPendingBookToReserve(book);
        setAuthMode('signin');
        setAuthModalOpen(true);
        return;
      }
      executeReservation(book, user);
    },
    [isAuthenticated, user, executeReservation]
  );

  const handleAuthSuccess = (userObj) => {
    setAuthModalOpen(false);
    triggerToast(`Welcome to AuraLib LK, ${userObj.name} (${userObj.membershipId || userObj.email})`);
    if (pendingBookToReserve) {
      executeReservation(pendingBookToReserve, userObj);
      setPendingBookToReserve(null);
    }
  };

  const handleBookStudyPod = (podId) => {
    if (!isAuthenticated || !user) {
      setAuthMode('signin');
      setAuthModalOpen(true);
      return;
    }
    setStudyPods((prev) =>
      prev.map((pod) =>
        pod.id === podId ? { ...pod, status: `Reserved by ${user.name}` } : pod
      )
    );
    triggerToast('Study Sanctuary Pod reserved for your session.');
  };

  // AI Recommendations Fetcher
  const handleFetchRecommendations = async () => {
    if (!isAuthenticated) {
      triggerToast('Sign in with a Member card to run personalized hybrid recommendations.');
      setAuthMode('signin');
      setAuthModalOpen(true);
      return;
    }
    setLoadingRecommendations(true);
    try {
      const interestsArray = recommendationInterests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const token = await getToken();
      const results = await apiRequest('/recommendations', {
        method: 'POST',
        token,
        body: { interests: interestsArray, limit: 6 }
      });
      setRecommendedBooks(results.map((b, i) => formatBook(b, i)));
      triggerToast('Generated neural hybrid recommendations based on your research interests.');
    } catch (err) {
      triggerToast(getApiError(err));
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Filtered & Sorted Catalogue Books
  const filteredBooks = useMemo(() => {
    return formattedBooks
      .filter((book) => {
        const matchesCat = selectedCategory === 'All' || book.category === selectedCategory;
        const matchesAvail = !onlyAvailable || Number(book.availableCopies) > 0;
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.isbn.toLowerCase().includes(q) ||
          book.callNumber.toLowerCase().includes(q) ||
          book.category.toLowerCase().includes(q);
        return matchesCat && matchesAvail && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'availability') return b.availableCopies - a.availableCopies;
        return (b.featuredIn3D ? 1 : 0) - (a.featuredIn3D ? 1 : 0);
      });
  }, [formattedBooks, selectedCategory, onlyAvailable, searchQuery, sortBy]);

  const categoriesList = [
    'All',
    'Fiction',
    'Science',
    'Technology',
    'History',
    'Business',
    'Education'
  ];

  // User's active loans & reservations from backend
  const userBorrowings = useMemo(() => {
    if (!user) return [];
    return borrowings.filter((b) => b.memberId === user.id);
  }, [borrowings, user]);

  return (
    <div className="min-h-screen relative selection:bg-[#C5A368] selection:text-[#231710] bg-[#F7F4EE]">
      <GlobalStyles />

      {/* ==================================================================
          INITIAL ARCHITECTURAL LOADING OVERLAY
      ================================================================== */}
      {loadingProgress < 100 && (
        <div className="fixed inset-0 z-50 bg-[#F7F4EE] flex flex-col items-center justify-center p-6 transition-opacity duration-700">
          <AuraLibLogo className="w-14 h-14 mb-6" />
          <div className="w-64 h-1 bg-[#E4DEC8] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#231710] transition-all duration-200"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="font-mono-code text-xs uppercase tracking-widest text-[#6E5A4F]">
            Initializing 3D Architectural Colonnade • {Math.min(100, loadingProgress)}%
          </p>
        </div>
      )}

      {/* ==================================================================
          PERSISTENT 3D WEBGL ARCHITECTURAL ENVIRONMENT
      ================================================================== */}
      <ArchitecturalLibraryCanvas
        scrollProgress={activeTab === 'journey' ? scrollProgress : 0.38}
        books={formattedBooks}
        onSelectBook={(bk) => setInspectedBook(bk)}
        hoveredBook3D={hoveredBook3D}
        setHoveredBook3D={setHoveredBook3D}
        reducedMotion={reducedMotion}
        highQuality={highQuality}
        onLoaded={(ok) => setWebglReady(ok)}
      />

      {/* Subtle Warm Sunlight Vignette Overlay for Reliable Contrast */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-500 ${
          activeTab === 'journey'
            ? 'bg-gradient-to-b from-[#F7F4EE]/60 via-transparent to-[#F7F4EE]/75'
            : 'bg-[#F7F4EE]/92 backdrop-blur-md'
        }`}
      />

      {/* ==================================================================
          TOP ARCHITECTURAL NAVIGATION BAR
      ================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto rounded-2xl arch-glass px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              setActiveTab('journey');
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left focus:outline-none"
          >
            <AuraLibLogo className="w-9 h-9" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary Navigation">
            {[
              { id: 'journey', path: '/', label: '3D Colonnade', icon: Compass },
              { id: 'catalogue', path: '/catalog', label: 'Explore Books', icon: BookOpen },
              { id: 'categories', path: '/categories', label: 'Book Categories', icon: Layers },
              {
                id: 'mylibrary',
                path: '/my-books',
                label: 'My Library',
                icon: Bookmark,
                badge: userBorrowings.length + savedBookIds.length
              },
              { id: 'recommendations', path: '/recommendations', label: 'AI Recommendations', icon: Sparkles },
              { id: 'about', path: '/about', label: 'About Us', icon: Library }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                    if (item.id !== 'journey') window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#231710] text-[#F7F4EE] shadow-sm'
                      : 'text-[#3A261A] hover:bg-[#231710]/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#C5A368]" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-code ${
                        isActive ? 'bg-[#C5A368] text-[#231710]' : 'bg-[#231710]/10 text-[#231710]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Utility Controls: Audio, Motion, Admin Portal & Auth */}
          <div className="flex items-center gap-2">
            {/* Ambient Sound Toggle */}
            <button
              onClick={handleToggleAudio}
              title={audioPlaying ? 'Mute Ambient Library Audio' : 'Enable Ambient Library Soundscape'}
              className={`p-2.5 rounded-xl border text-xs transition-colors ${
                audioPlaying
                  ? 'bg-[#234233] text-[#F7F4EE] border-[#234233]'
                  : 'border-[#C5A368]/40 text-[#3A261A] hover:bg-[#EFECE6]'
              }`}
              aria-label="Toggle Ambient Audio"
            >
              {audioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reduced Motion Toggle */}
            <button
              onClick={() => {
                setReducedMotion(!reducedMotion);
                triggerToast(
                  !reducedMotion
                    ? 'Reduced Motion Mode Enabled (Restrained Camera)'
                    : 'Cinematic Camera Motion Restored'
                );
              }}
              title="Toggle Reduced Motion"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono-code transition-colors ${
                reducedMotion
                  ? 'bg-[#231710] text-[#F7F4EE] border-[#231710]'
                  : 'border-[#C5A368]/40 text-[#3A261A] hover:bg-[#EFECE6]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A368]" />
              <span>{reducedMotion ? 'Motion: Calm' : '3D: Fluid'}</span>
            </button>

            {/* Admin Portal Shortcut if Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C5A368] hover:bg-[#D4B886] text-[#231710] font-semibold text-xs tracking-wider transition-colors shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            )}

            {/* Member Profile or Sign In CTA */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('mylibrary');
                    navigate('/my-books');
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EFECE6] border border-[#C5A368]/50 text-xs font-medium text-[#231710] hover:bg-[#E4DEC8]"
                >
                  <div className="w-2 h-2 rounded-full bg-[#234233]" />
                  <span className="hidden sm:inline">{user.name?.split(' ')[0] || (user.role === 'admin' ? 'Library / Admin' : 'Member')}</span>
                  <span className="font-mono-code text-[10px] text-[#6E5A4F]">
                    {(user.membershipId || user.email || 'AL').slice(-4)}
                  </span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    triggerToast('Signed out of AuraLib Member Account');
                  }}
                  title="Sign Out"
                  className="p-2 rounded-xl border border-[#C5A368]/40 text-[#6E5A4F] hover:text-[#231710] hover:bg-[#EFECE6]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#231710] hover:bg-[#3A261A] text-[#F7F4EE] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-[#C5A368]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-[#C5A368]/40 text-[#231710]"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl arch-glass p-4 space-y-2">
            {[
              { id: 'journey', path: '/', label: '3D Colonnade Journey' },
              { id: 'catalogue', path: '/catalog', label: 'Explore Books Catalogue' },
              { id: 'categories', path: '/categories', label: 'Book Categories' },
              {
                id: 'mylibrary',
                path: '/my-books',
                label: `My Library (${userBorrowings.length + savedBookIds.length})`
              },
              { id: 'recommendations', path: '/recommendations', label: 'AI Recommendations' },
              { id: 'about', path: '/about', label: 'About Us' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${
                  activeTab === item.id ? 'bg-[#231710] text-[#F7F4EE]' : 'text-[#231710] hover:bg-[#231710]/10'
                }`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-[#9B783E] bg-[#C5A368]/15"
              >
                Admin & Librarian Portal →
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ==================================================================
          FLOATING 3D RAYCAST BOOK TOOLTIP
      ================================================================== */}
      {hoveredBook3D && activeTab === 'journey' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fadeIn">
          <div className="arch-glass-dark text-[#F7F4EE] px-5 py-3 rounded-2xl flex items-center gap-4 shadow-2xl border border-[#C5A368]/50">
            <div
              className="w-3 h-10 rounded-sm"
              style={{ backgroundColor: hoveredBook3D.coverPalette?.primary || '#231710' }}
            />
            <div>
              <div className="text-[10px] font-mono-code uppercase tracking-widest text-[#D4B886]">
                Click 3D Volume to Inspect • {hoveredBook3D.shelfLocation}
              </div>
              <div className="font-editorial text-lg font-semibold leading-tight">
                {hoveredBook3D.title}
              </div>
              <div className="text-xs text-[#E4DEC8]">{hoveredBook3D.author}</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================
          NOTIFICATION TOAST BANNER
      ================================================================== */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 max-w-sm arch-glass-dark text-[#F7F4EE] px-4 py-3.5 rounded-xl border border-[#C5A368] shadow-2xl flex items-center gap-3 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#C5A368] flex-shrink-0" />
          <span className="text-xs leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================
          VIEW 1: SIGNATURE 6-SCENE SCROLL-DRIVEN 3D JOURNEY
      ================================================================== */}
      {activeTab === 'journey' && (
        <main className="relative z-10 pointer-events-none">
          {/* Chapter Scrubbing Rail */}
          <aside
            className="fixed right-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2.5 pointer-events-auto"
            aria-label="3D Story Chapters"
          >
            <div className="arch-glass px-2.5 py-3 rounded-2xl flex flex-col gap-2 items-center">
              {SCENE_CHAPTERS.map((chap, idx) => {
                const isCurrent = activeChapterIndex === idx;
                return (
                  <button
                    key={chap.id}
                    onClick={() => scrollToChapter(idx)}
                    className="group relative flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                    title={`${chap.code}. ${chap.label}`}
                  >
                    <span
                      className={`font-mono-code text-[11px] font-medium transition-all ${
                        isCurrent
                          ? 'w-7 h-7 rounded-lg bg-[#231710] text-[#C5A368] flex items-center justify-center shadow-sm'
                          : 'text-[#6E5A4F] group-hover:text-[#231710]'
                      }`}
                    >
                      {chap.code}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute right-10 px-3 py-1.5 rounded-lg arch-glass-dark text-[#F7F4EE] text-xs whitespace-nowrap shadow-lg">
                      {chap.label}
                    </span>
                  </button>
                );
              })}
              <div className="w-1 h-16 bg-[#C5A368]/25 rounded-full overflow-hidden mt-1">
                <div
                  className="w-full bg-[#231710] transition-all duration-150"
                  style={{ height: `${Math.round(scrollProgress * 100)}%` }}
                />
              </div>
            </div>
          </aside>

          {/* SCENE 1 — THE ENTRANCE */}
          <section className="min-h-screen flex flex-col justify-between pt-28 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="my-auto max-w-2xl pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full arch-glass mb-6">
                <span className="w-2 h-2 rounded-full bg-[#234233] animate-pulse" />
                <span className="font-mono-code text-[11px] uppercase tracking-widest text-[#3A261A]">
                  Scene 01 • Grand Colonnade Entrance • A New Dimension of Discovery
                </span>
              </div>

              <h1 className="font-editorial text-5xl sm:text-7xl font-semibold text-[#231710] tracking-tight leading-[1.04]">
                Enter a world of knowledge.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-[#3A261A] leading-relaxed max-w-xl bg-[#F7F4EE]/70 backdrop-blur-sm p-4 rounded-xl border border-[#C5A368]/30">
                Discover stories, explore ideas, and find your next great read in a smarter
                library experience—where contemporary Sri Lankan architectural serenity meets
                real-time shelf telemetry.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => scrollToChapter(1)}
                  className="px-7 py-4 rounded-xl bg-[#231710] hover:bg-[#3A261A] text-[#F7F4EE] font-medium text-sm flex items-center gap-3 shadow-xl transition-all group"
                >
                  <span>Explore the Library</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A368] transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('catalogue');
                    navigate('/catalog');
                  }}
                  className="px-7 py-4 rounded-xl arch-glass hover:bg-[#F7F4EE] text-[#231710] font-medium text-sm flex items-center gap-2 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-[#9B783E]" />
                  <span>Discover Our Collection</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 pointer-events-auto">
              <button
                onClick={() => scrollToChapter(1)}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full arch-glass text-xs font-mono-code text-[#3A261A] hover:border-[#231710] transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-[#C5A368] animate-bounce" />
                <span>Scroll to walk through the 3D Colonnade (or click any glowing volume)</span>
              </button>

              <div className="hidden sm:flex items-center gap-6 arch-glass px-5 py-2.5 rounded-full text-xs font-mono-code text-[#3A261A]">
                <span>{formattedBooks.length} VOLUMES AVAILABLE</span>
                <span className="text-[#C5A368]">•</span>
                <span>COLOMBO ATRIUM OPEN UNTIL 21:00</span>
              </div>
            </div>
          </section>

          {/* SCENE 2 — THE GRAND BOOKSHELF */}
          <section className="min-h-screen flex items-center py-24 px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="ml-auto max-w-xl w-full arch-glass rounded-3xl p-7 sm:p-9 pointer-events-auto space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
                  Scene 02 • The Grand Bookshelf Aisle
                </span>
                <span className="px-2.5 py-1 rounded bg-[#234233]/15 text-[#234233] font-mono-code text-xs">
                  Bay Telemetry Active
                </span>
              </div>

              <h2 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#231710] leading-tight">
                Towering walnut archives, indexed to the millimeter.
              </h2>

              <p className="text-sm sm:text-base text-[#3A261A] leading-relaxed">
                As you move down the central travertine colonnade, every shelf bay is connected
                to AuraLib’s optical spine-recognition network. Search by ISBN, call number, or
                conceptual theme and illuminate the exact physical bay prior to arrival.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#C5A368]/30">
                  <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#231710]">
                    {formattedBooks.length}
                  </div>
                  <div className="text-[11px] font-mono-code text-[#6E5A4F] mt-0.5">
                    Curated Volumes
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#C5A368]/30">
                  <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#234233]">
                    99.4%
                  </div>
                  <div className="text-[11px] font-mono-code text-[#6E5A4F] mt-0.5">
                    Shelf Accuracy
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#C5A368]/30">
                  <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#231710]">
                    &lt; 40ms
                  </div>
                  <div className="text-[11px] font-mono-code text-[#6E5A4F] mt-0.5">
                    ISBN Lookup
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#C5A368]/30">
                <span className="font-mono-code text-xs text-[#6E5A4F]">
                  Current Coordinate: Wing A–B • Colonnade Span 02
                </span>
                <button
                  onClick={() => scrollToChapter(2)}
                  className="text-xs font-semibold text-[#231710] hover:text-[#9B783E] flex items-center gap-1"
                >
                  <span>Approach Featured Bay</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* SCENE 3 — DISCOVER THE COLLECTION */}
          <section className="min-h-screen flex items-center py-24 px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="max-w-xl w-full arch-glass rounded-3xl p-7 sm:p-9 pointer-events-auto space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
                  Scene 03 • Featured Bookshelf Bay
                </span>
                <span className="text-xs font-mono-code text-[#234233]">
                  • Interactive 3D Volumes
                </span>
              </div>

              <h2 className="font-editorial text-4xl font-semibold text-[#231710] leading-tight">
                Curated acquisitions on the West Colonnade.
              </h2>

              <p className="text-sm text-[#3A261A] leading-relaxed">
                Select any highlighted book directly on the 3D walnut shelves—or choose from the
                bay ledger below—to inspect its 3D linen binding, verify copy availability, or
                reserve for immediate pickup.
              </p>

              <div className="space-y-3">
                {formattedBooks.slice(0, 4).map((book) => (
                  <div
                    key={book.id}
                    onClick={() => setInspectedBook(book)}
                    className="group p-3.5 rounded-2xl bg-[#EFECE6]/90 hover:bg-[#231710] hover:text-[#F7F4EE] border border-[#C5A368]/35 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-3.5 h-12 rounded-sm flex-shrink-0 border border-[#C5A368]/50"
                        style={{ backgroundColor: book.coverPalette?.primary || '#231710' }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code text-[10px] uppercase tracking-wider text-[#9B783E]">
                            {book.category} • {book.shelfLocation}
                          </span>
                        </div>
                        <h3 className="font-editorial text-xl font-semibold truncate">
                          {book.title}
                        </h3>
                        <p className="text-xs opacity-75 truncate">{book.author}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span
                        className={`text-[10px] font-mono-code px-2 py-0.5 rounded ${
                          book.availableCopies > 0
                            ? 'bg-[#234233]/20 text-[#234233] group-hover:bg-[#C5A368] group-hover:text-[#231710]'
                            : 'bg-amber-900/20 text-amber-900'
                        }`}
                      >
                        {book.availableCopies > 0 ? `${book.availableCopies} Avail` : 'Waitlist'}
                      </span>
                      <span className="text-[11px] font-medium mt-1.5 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        Inspect 3D <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SCENE 4 — FEATURED READING LOUNGE */}
          <section className="min-h-screen flex items-center py-24 px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="w-full space-y-6 pointer-events-auto">
              <div className="max-w-xl arch-glass p-6 sm:p-8 rounded-3xl">
                <span className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
                  Scene 04 • The Reading Lounge
                </span>
                <h2 className="font-editorial text-4xl font-semibold text-[#231710] mt-1">
                  Sunlit travertine tables & tactile editions.
                </h2>
                <p className="text-sm text-[#3A261A] mt-2 leading-relaxed">
                  Our central reading tables pair warm brass banker lamps with natural zenithal
                  daylight. Preview our Library / Admin’s monthly monograph selections below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {formattedBooks.slice(0, 3).map((book) => {
                  const coverUrl = generateBookCoverDataURL(book);
                  return (
                    <div
                      key={book.id}
                      className="arch-glass rounded-3xl p-5 flex flex-col justify-between hover:border-[#231710] transition-all group"
                    >
                      <div>
                        <div className="relative h-52 rounded-2xl bg-gradient-to-b from-[#E4DEC8] to-[#EFECE6] flex items-center justify-center p-4 overflow-hidden mb-4">
                          <img
                            src={coverUrl}
                            alt={book.title}
                            className="h-44 w-auto object-contain rounded shadow-xl transform group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300"
                          />
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#231710]/85 text-[#F7F4EE] font-mono-code text-[10px]">
                            {book.pages} pages
                          </span>
                        </div>

                        <div className="font-mono-code text-[10px] uppercase tracking-widest text-[#9B783E]">
                          {book.category} • {book.callNumber}
                        </div>
                        <h3 className="font-editorial text-2xl font-semibold text-[#231710] mt-1">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#6E5A4F] mt-0.5">{book.author}</p>
                        <p className="text-xs text-[#3A261A] mt-3 line-clamp-2 leading-relaxed">
                          {book.synopsis}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#C5A368]/30 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setInspectedBook(book)}
                          className="text-xs font-semibold text-[#231710] hover:text-[#9B783E] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>3D Preview & Excerpt</span>
                        </button>

                        <button
                          onClick={() => handleReserveBook(book)}
                          className="px-3.5 py-2 rounded-xl bg-[#231710] text-[#F7F4EE] text-xs font-medium hover:bg-[#3A261A]"
                        >
                          {!user ? 'Login to Reserve' : 'Reserve'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SCENE 5 — SMART LIBRARY FEATURES & WORKSPACE */}
          <section className="min-h-screen flex items-center py-24 px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full pointer-events-auto">
              <div className="lg:col-span-7 arch-glass rounded-3xl p-7 sm:p-9 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
                    Scene 05 • Smart Library Workspace
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#234233]">
                    <Cpu className="w-3.5 h-3.5" /> Live Kiosk Terminal
                  </span>
                </div>

                <h2 className="font-editorial text-4xl font-semibold text-[#231710]">
                  Instant shelf telemetry & study pod reservations.
                </h2>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#6E5A4F] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Try typing 'Bawa', 'Quantum', 'Maali', or an ISBN..."
                    className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-white/90 border border-[#C5A368]/50 text-sm text-[#231710] focus:outline-none focus:border-[#231710]"
                  />
                  <button
                    onClick={() => {
                      setActiveTab('catalogue');
                      navigate('/catalog');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-xl bg-[#231710] text-[#F7F4EE] text-xs font-medium"
                  >
                    Full Catalogue
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {filteredBooks.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setInspectedBook(b)}
                      className="p-3 rounded-xl bg-[#EFECE6] hover:bg-[#E4DEC8] border border-[#C5A368]/30 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-editorial text-lg font-semibold text-[#231710]">
                          {b.title}
                        </div>
                        <div className="text-xs font-mono-code text-[#6E5A4F]">
                          {b.author} • {b.shelfLocation}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-mono-code bg-[#234233]/15 text-[#234233]">
                        {b.availableCopies > 0 ? `${b.availableCopies} on Shelf` : 'Waitlist'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 arch-glass rounded-3xl p-7 space-y-4">
                <div className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
                  Colombo Atrium • Acoustic Study Pods
                </div>
                <h3 className="font-editorial text-2xl font-semibold text-[#231710]">
                  Reserve a Private Reading Sanctuary
                </h3>

                <div className="space-y-3">
                  {studyPods.map((pod) => {
                    const isAvailable = pod.status === 'Available';
                    return (
                      <div
                        key={pod.id}
                        className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#C5A368]/30 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-[#231710]">{pod.name}</span>
                          <span
                            className={`text-[10px] font-mono-code px-2 py-0.5 rounded ${
                              isAvailable
                                ? 'bg-[#234233]/15 text-[#234233]'
                                : 'bg-amber-900/15 text-amber-900'
                            }`}
                          >
                            {pod.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#6E5A4F]">
                          {pod.zone} • {pod.capacity}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-mono-code text-[#3A261A]">
                            {pod.features.slice(0, 2).join(' • ')}
                          </span>
                          {isAvailable && (
                            <button
                              onClick={() => handleBookStudyPod(pod.id)}
                              className="px-3 py-1 rounded-lg bg-[#231710] text-[#F7F4EE] text-xs font-medium hover:bg-[#3A261A]"
                            >
                              Book Pod
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* SCENE 6 — THE FINAL REVEAL */}
          <section className="min-h-screen flex items-center justify-center py-24 px-4 sm:px-8 max-w-5xl mx-auto text-center">
            <div className="arch-glass rounded-3xl p-8 sm:p-14 w-full pointer-events-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A368]/20 text-[#3A261A] font-mono-code text-xs uppercase tracking-widest">
                <Sun className="w-3.5 h-3.5 text-[#9B783E]" />
                Scene 06 • The Sunlit Reading Atrium
              </div>

              <h2 className="font-editorial text-5xl sm:text-6xl font-semibold text-[#231710] leading-tight">
                Your next chapter begins here.
              </h2>

              <p className="text-base sm:text-lg text-[#3A261A] max-w-2xl mx-auto leading-relaxed">
                Step into our full interactive catalogue to search every volume by ISBN, filter
                across academic and literary disciplines, or manage your active Atrium pickup
                tickets.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setActiveTab('catalogue');
                    navigate('/catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-8 py-4 rounded-xl bg-[#231710] hover:bg-[#3A261A] text-[#F7F4EE] font-medium text-sm flex items-center gap-3 shadow-xl transition-all"
                >
                  <BookOpen className="w-4 h-4 text-[#C5A368]" />
                  <span>Browse Full Library Catalogue</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('mylibrary');
                    navigate('/my-books');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-7 py-4 rounded-xl bg-[#EFECE6] hover:bg-[#E4DEC8] text-[#231710] border border-[#C5A368]/50 font-medium text-sm flex items-center gap-2 transition-all"
                >
                  <Bookmark className="w-4 h-4 text-[#9B783E]" />
                  <span>Open My Library ({userBorrowings.length + savedBookIds.length})</span>
                </button>

                <button
                  onClick={() => scrollToChapter(0)}
                  className="px-5 py-4 rounded-xl text-xs font-mono-code uppercase tracking-wider text-[#6E5A4F] hover:text-[#231710]"
                >
                  ↑ Return to Entrance
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ==================================================================
          VIEW 2: COMPLETE ARCHIVAL CATALOGUE & SEARCH SYSTEM
      ================================================================== */}
      {activeTab === 'catalogue' && (
        <section className="relative z-20 pt-28 pb-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#C5A368]/35 pb-6">
            <div>
              <span className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
                AuraLib LK • Integrated Library Management System
              </span>
              <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#231710] mt-1">
                Browse All Books
              </h1>
            </div>
            <div className="text-xs font-mono-code text-[#6E5A4F]">
              Showing <strong>{filteredBooks.length}</strong> of {formattedBooks.length} Curated
              Monographs & Editions
            </div>
          </div>

          <div className="arch-glass rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 relative">
                <Search className="w-4 h-4 text-[#6E5A4F] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by book title, author, ISBN-13, call number, or keyword..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-white border border-[#C5A368]/50 text-sm text-[#231710] focus:outline-none focus:border-[#231710]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5A4F] hover:text-[#231710]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="lg:col-span-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#9B783E] flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-3 px-3.5 rounded-xl bg-white border border-[#C5A368]/50 text-sm text-[#231710] focus:outline-none"
                >
                  <option value="featured">Sort: Curated & 3D Featured</option>
                  <option value="availability">Sort: Available Copies First</option>
                  <option value="year">Sort: Publication Year (Newest)</option>
                  <option value="title">Sort: Alphabetical (A–Z)</option>
                </select>
              </div>

              <div className="lg:col-span-3 flex items-center">
                <button
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className={`w-full py-3 px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                    onlyAvailable
                      ? 'bg-[#234233] text-[#F7F4EE] border-[#234233]'
                      : 'bg-white border-[#C5A368]/50 text-[#231710] hover:bg-[#EFECE6]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Available on Shelf Only</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#231710] text-[#F7F4EE] shadow-sm'
                      : 'bg-[#EFECE6] text-[#3A261A] hover:bg-[#E4DEC8]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="arch-glass rounded-3xl p-12 text-center space-y-4">
              <BookOpen className="w-10 h-10 text-[#C5A368] mx-auto" />
              <h3 className="font-editorial text-3xl font-semibold text-[#231710]">
                No volumes matched your query
              </h3>
              <p className="text-sm text-[#6E5A4F] max-w-md mx-auto">
                We could not find any titles matching “{searchQuery}” in {selectedCategory}. Try
                clearing your filters or searching by broader keywords.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setOnlyAvailable(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#231710] text-[#F7F4EE] text-xs font-medium"
              >
                Reset Catalogue Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const coverUrl = generateBookCoverDataURL(book);
                const isSaved = savedBookIds.includes(book.id);
                const isAvail = Number(book.availableCopies) > 0;
                return (
                  <article
                    key={book.id}
                    className="arch-glass rounded-3xl p-5 flex flex-col justify-between border border-[#C5A368]/35 hover:border-[#231710] transition-all group"
                  >
                    <div>
                      <div className="relative h-56 rounded-2xl bg-gradient-to-br from-[#EFECE6] to-[#E4DEC8] p-4 flex items-center justify-center mb-4 overflow-hidden">
                        <img
                          src={coverUrl}
                          alt={book.title}
                          onClick={() => setInspectedBook(book)}
                          className="h-48 w-auto object-contain rounded shadow-xl cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => handleToggleSaved(book.id)}
                          title={isSaved ? "Added to List" : "Add to List"}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                            isSaved
                              ? 'bg-[#234233] text-[#F7F4EE]'
                              : 'bg-white/80 text-[#231710] hover:bg-white'
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-[#231710]/85 text-[#F7F4EE] font-mono-code text-[10px]">
                          {book.shelfLocation}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono-code uppercase tracking-wider text-[#9B783E]">
                          {book.category}
                        </span>
                        <span
                          className={`font-mono-code text-[11px] px-2 py-0.5 rounded ${
                            isAvail
                              ? 'bg-[#234233]/15 text-[#234233]'
                              : 'bg-amber-900/15 text-amber-900'
                          }`}
                        >
                          {isAvail
                            ? `${book.availableCopies}/${book.totalCopies} Available`
                            : 'Waitlist Open'}
                        </span>
                      </div>

                      <h2
                        onClick={() => setInspectedBook(book)}
                        className="font-editorial text-2xl font-semibold text-[#231710] mt-1.5 cursor-pointer hover:text-[#9B783E] leading-snug"
                      >
                        {book.title}
                      </h2>
                      <p className="text-xs font-medium text-[#3A261A] mt-0.5">{book.author}</p>
                      <p className="text-xs text-[#6E5A4F] mt-2 line-clamp-2 leading-relaxed">
                        {book.synopsis}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[#C5A368]/30 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setInspectedBook(book)}
                        className="px-3.5 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#E4DEC8] text-[#231710] text-xs font-medium flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#9B783E]" />
                        <span>Inspect 3D</span>
                      </button>

                      <button
                        onClick={() => handleReserveBook(book)}
                        className="flex-1 py-2 px-4 rounded-xl bg-[#231710] hover:bg-[#3A261A] text-[#F7F4EE] text-xs font-medium text-center transition-colors"
                      >
                        {isAvail ? (!user ? 'Login to Reserve' : 'Reserve Book') : 'Join Waitlist'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ==================================================================
          VIEW 3: CURATED COLLECTIONS & SPATIAL WINGS
      ================================================================== */}
      {activeTab === 'categories' && (
        <section className="relative z-20 pt-28 pb-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-10 animate-fadeIn">
          <div className="border-b border-[#C5A368]/35 pb-6">
            <span className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
              Spatial Wings & Collections
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#231710] mt-1">
              Book Categories
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                cat: 'History',
                wing: 'Wing A • Heritage & Monsoon Architecture',
                desc: 'Sri Lankan architectural monographs, archaeological surveys of Sigiriya and Anuradhapura, and Indian Ocean cartography.'
              },
              {
                cat: 'Fiction',
                wing: 'Wing B • Contemporary & Booker Literature',
                desc: 'Award-winning South Asian and global literary fiction, first-edition hardcovers, and translated poetry.'
              },
              {
                cat: 'Technology',
                wing: 'Wing C • Neural & Cryptographic Systems',
                desc: 'Semantic vector topologies, distributed consensus, zero-knowledge archives, and computational design.'
              },
              {
                cat: 'Science',
                wing: 'Wing A–C • Hydraulic & Quantum Sciences',
                desc: 'From ancient Rajarata cascade irrigation engineering to quantum thermodynamics and ecology.'
              },
              {
                cat: 'Business',
                wing: 'Wing D • Maritime Trade & Stewardship',
                desc: 'Economic history of the spice routes, sovereign regenerative capital, and institutional governance.'
              },
              {
                cat: 'Education',
                wing: 'Wing E • Epistemic Inquiry & Poetics',
                desc: 'Phenomenology of architecture, Socratic pedagogy, and cognitive sanctuaries.'
              }
            ].map((item) => {
              const count = formattedBooks.filter((b) => b.category === item.cat).length;
              return (
                <div
                  key={item.cat}
                  onClick={() => {
                    setSelectedCategory(item.cat);
                    setActiveTab('catalogue');
                    navigate('/catalog');
                  }}
                  className="arch-glass rounded-3xl p-7 flex flex-col justify-between cursor-pointer hover:border-[#231710] transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-code text-xs text-[#9B783E]">{item.wing}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#231710] text-[#C5A368] font-mono-code text-xs">
                        {count} Volumes
                      </span>
                    </div>
                    <h2 className="font-editorial text-3xl font-semibold text-[#231710] group-hover:text-[#9B783E] transition-colors">
                      {item.cat}
                    </h2>
                    <p className="text-sm text-[#3A261A] leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#C5A368]/30 flex items-center justify-between text-xs font-medium text-[#231710]">
                    <span>Browse {item.cat} Wing</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A368] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================================
          VIEW 4: MY LIBRARY (RESERVATIONS, REAL BORROWINGS, READING LIST)
      ================================================================== */}
      {activeTab === 'mylibrary' && (
        <section className="relative z-20 pt-28 pb-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-10 animate-fadeIn">
          {/* Member Banner */}
          <div className="arch-glass rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
                Personal Member Dashboard
              </span>
              <h1 className="font-editorial text-4xl font-semibold text-[#231710] mt-1">
                {user ? `${user.name}’s Library` : 'My Library & Reading List'}
              </h1>
              <p className="text-sm text-[#6E5A4F] mt-1">
                {user
                  ? `${user.role === 'admin' ? 'Library / Admin' : 'Member'} • Card ID: ${
                      user.membershipId || user.email
                    }`
                  : 'Sign in with our one-click Member Account to issue pickup tickets and sync across devices.'}
              </p>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-5 py-2.5 rounded-xl bg-[#C5A368] hover:bg-[#D4B886] text-[#231710] font-semibold text-xs tracking-wider transition-colors shadow-sm"
                  >
                    Manage Archive in Admin Portal
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await logout();
                    triggerToast('Signed out of Member Account');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#C5A368]/50 text-xs font-medium text-[#3A261A] hover:bg-[#EFECE6] flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="px-6 py-3 rounded-xl bg-[#231710] text-[#F7F4EE] text-xs font-medium flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#C5A368]" />
                <span>Sign In / Activate Member Card</span>
              </button>
            )}
          </div>

          {/* Active Reservations & Loans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-3xl font-semibold text-[#231710]">
                Reserved Books ({userBorrowings.length})
              </h2>
              {user && (
                <span className="font-mono-code text-xs text-[#234233]">
                  Connected to Cloud Firestore
                </span>
              )}
            </div>

            {userBorrowings.length === 0 ? (
              <div className="arch-glass rounded-2xl p-8 text-center space-y-3">
                <QrCode className="w-8 h-8 text-[#C5A368] mx-auto" />
                <p className="text-sm text-[#3A261A]">
                  You have no active book reservation tickets yet. Reserve any volume in the 3D
                  library or catalogue to generate an instant Atrium pickup pass.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('catalogue');
                    navigate('/catalog');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#231710] text-[#F7F4EE] text-xs font-medium"
                >
                  Explore Catalogue to Reserve
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {userBorrowings.map((res) => {
                  const book =
                    formattedBooks.find((b) => b.id === res.bookId) || {
                      title: res.bookTitle || 'Archival Volume',
                      author: res.bookAuthor || 'Unknown Author',
                      shelfLocation: 'Wing A • Central Circulation Desk',
                      callNumber: 'AL-HOLD-2026'
                    };

                  const isPending = res.status === 'pending';
                  const isApproved = res.status === 'approved';
                  const isOverdue = res.status === 'overdue';
                  const isReturned = res.status === 'returned';

                  return (
                    <div
                      key={res.id}
                      className="arch-glass rounded-2xl p-6 border-l-4 border-l-[#234233] flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span
                            className={`font-mono-code text-xs px-2.5 py-0.5 rounded ${
                              isApproved
                                ? 'bg-[#234233]/15 text-[#234233]'
                                : isPending
                                ? 'bg-[#C5A368]/20 text-[#9B783E]'
                                : isOverdue
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isApproved
                              ? 'Active Loan • Hold Ready'
                              : isPending
                              ? 'Pending Librarian Approval'
                              : isOverdue
                              ? 'Overdue Return Required'
                              : 'Returned to Archive'}
                          </span>
                          <h3 className="font-editorial text-2xl font-semibold text-[#231710] mt-2">
                            {res.bookTitle || book.title}
                          </h3>
                          <p className="text-xs text-[#6E5A4F]">{res.bookAuthor || book.author}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#EFECE6] border border-[#C5A368]/40 text-center">
                          <QrCode className="w-7 h-7 text-[#231710] mx-auto" />
                          <span className="font-mono-code text-[10px] text-[#3A261A] block mt-1">
                            {res.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-mono-code text-[#3A261A] space-y-1 pt-3 border-t border-[#C5A368]/30">
                        <div>Shelf Coordinate: {book.shelfLocation}</div>
                        <div>
                          Loan Window:{' '}
                          {res.dueDate ? `Due by ${res.dueDate}` : 'Standard 14-Day Hold Period'}
                        </div>
                        <div>Holder: {res.memberName || user?.name}</div>
                      </div>

                      {/* Loan Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#C5A368]/20">
                        {isPending && (
                          <button
                            onClick={async () => {
                              await cancelRequest(res.id);
                              triggerToast('Hold request cancelled.');
                            }}
                            className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-800 text-xs font-medium hover:bg-rose-50"
                          >
                            Cancel Request
                          </button>
                        )}
                        {(isApproved || isOverdue) && (
                          <>
                            <button
                              onClick={async () => {
                                await renewBook(res.id);
                                triggerToast('Loan renewed for 7 additional days.');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#EFECE6] hover:bg-[#E4DEC8] text-[#231710] text-xs font-medium flex items-center gap-1"
                            >
                              <RotateCw className="w-3 h-3 text-[#9B783E]" />
                              <span>Renew (+7 Days)</span>
                            </button>
                            <button
                              onClick={async () => {
                                await returnBook(res.id);
                                triggerToast('Volume safely checked back into library catalogue.');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#231710] hover:bg-[#3A261A] text-[#F7F4EE] text-xs font-medium"
                            >
                              Return Volume
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Personal Reading List */}
          <div className="space-y-4">
            <h2 className="font-editorial text-3xl font-semibold text-[#231710]">
              My Reading List ({savedBookIds.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {formattedBooks
                .filter((b) => savedBookIds.includes(b.id))
                .map((book) => (
                  <div
                    key={book.id}
                    className="arch-glass rounded-2xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#9B783E]">
                        {book.category} • {book.callNumber}
                      </span>
                      <h3 className="font-editorial text-2xl font-semibold text-[#231710] mt-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#6E5A4F]">{book.author}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#C5A368]/30">
                      <button
                        onClick={() => setInspectedBook(book)}
                        className="text-xs font-medium text-[#231710] hover:underline"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleToggleSaved(book.id)}
                        className="text-xs text-[#6E5A4F] hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================
          VIEW 5: HYBRID AI RECOMMENDATIONS (CONNECTED TO /recommendations)
      ================================================================== */}
      {activeTab === 'recommendations' && (
        <section className="relative z-20 pt-28 pb-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
          <div className="arch-glass rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-2 text-[#9B783E] font-mono-code text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-[#C5A368]" />
              Hybrid AI Epistemic Recommendations Engine
            </div>
            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#231710]">
              Discover your next research monograph.
            </h1>
            <p className="text-sm text-[#3A261A] max-w-2xl leading-relaxed">
              Our backend hybrid model connects TF-IDF semantic vector analysis with collaborative
              reading patterns across the Colombo archive. Enter topics of interest to generate
              personalized match scores.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={recommendationInterests}
                onChange={(e) => setRecommendationInterests(e.target.value)}
                placeholder="e.g. Tropical Architecture, Neural Systems, Sri Lankan Trade, Quantum Information..."
                className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-[#C5A368]/50 text-sm text-[#231710] focus:outline-none focus:border-[#231710]"
              />
              <button
                onClick={handleFetchRecommendations}
                disabled={loadingRecommendations}
                className="px-6 py-3.5 rounded-xl bg-[#231710] hover:bg-[#3A261A] text-[#F7F4EE] text-sm font-medium flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#C5A368]" />
                <span>{loadingRecommendations ? 'Synthesizing...' : 'Generate Recommendations'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(recommendedBooks.length > 0 ? recommendedBooks : formattedBooks.slice(0, 6)).map(
              (book) => {
                const coverUrl = generateBookCoverDataURL(book);
                return (
                  <div
                    key={book.id}
                    className="arch-glass rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-[#231710] transition-all group"
                  >
                    <div>
                      <div className="relative h-48 rounded-2xl bg-gradient-to-br from-[#EFECE6] to-[#E4DEC8] p-3 flex items-center justify-center mb-3">
                        <img
                          src={coverUrl}
                          alt={book.title}
                          className="h-40 w-auto object-contain rounded shadow-lg"
                        />
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#234233] text-[#F7F4EE] font-mono-code text-[10px]">
                          {book.matchScore || Math.floor(88 + Math.random() * 11)}% Match
                        </span>
                      </div>

                      <span className="font-mono-code text-[10px] uppercase text-[#9B783E]">
                        {book.category} • {book.shelfLocation}
                      </span>
                      <h3 className="font-editorial text-2xl font-semibold text-[#231710] mt-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#6E5A4F]">{book.author}</p>
                      <p className="text-xs text-[#3A261A] mt-2 line-clamp-2 leading-relaxed">
                        {book.reason || book.synopsis}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#C5A368]/30 flex items-center justify-between">
                      <button
                        onClick={() => setInspectedBook(book)}
                        className="text-xs font-medium text-[#231710] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#9B783E]" />
                        <span>Inspect 3D</span>
                      </button>
                      <button
                        onClick={() => handleReserveBook(book)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#231710] text-[#F7F4EE] text-xs font-medium hover:bg-[#3A261A]"
                      >
                        {!user ? 'Login to Reserve' : 'Reserve'}
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* ==================================================================
          VIEW 6: ARCHITECTURAL MANIFESTO & ABOUT AURALIB
      ================================================================== */}
      {activeTab === 'about' && (
        <section className="relative z-20 pt-28 pb-24 px-4 sm:px-8 max-w-5xl mx-auto space-y-10 animate-fadeIn">
          <div className="arch-glass rounded-3xl p-8 sm:p-12 space-y-6">
            <span className="font-mono-code text-xs uppercase tracking-widest text-[#9B783E]">
              About Us • Colombo, Sri Lanka
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl font-semibold text-[#231710] leading-tight">
              Where Tropical Modernism meets epistemic clarity.
            </h1>
            <p className="text-base text-[#3A261A] leading-relaxed">
              AuraLib LK was conceived as both a physical architectural sanctuary in Colombo and a
              spatial WebGL digital twin. Inspired by Sri Lanka’s rich tradition of monsoon
              courtyards, deep walnut timber colonnades, and honed travertine stone, the library
              rejects cold fluorescent stacks in favor of natural zenithal daylight and calm acoustic
              warmth.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
              <div className="p-5 rounded-2xl bg-[#EFECE6] border border-[#C5A368]/30 space-y-2">
                <Award className="w-6 h-6 text-[#9B783E]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#231710]">
                  Spatial Telemetry
                </h3>
                <p className="text-xs text-[#3A261A] leading-relaxed">
                  Every volume is mapped to its physical Wing, Bay, and Shelf coordinate for
                  seamless transition between digital discovery and physical reading.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#EFECE6] border border-[#C5A368]/30 space-y-2">
                <Globe className="w-6 h-6 text-[#234233]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#231710]">
                  Ceylon & Global Archives
                </h3>
                <p className="text-xs text-[#3A261A] leading-relaxed">
                  Housing rare monographs on Rajarata hydraulic engineering and Geoffrey Bawa
                  alongside contemporary science and philosophy.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#EFECE6] border border-[#C5A368]/30 space-y-2">
                <ShieldCheck className="w-6 h-6 text-[#9B783E]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#231710]">
                  Open WebGL Standard
                </h3>
                <p className="text-xs text-[#3A261A] leading-relaxed">
                  Engineered with procedural textures, instanced 3D geometry, and accessible
                  reduced-motion controls for smooth performance on any device.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================
          REFINED ARCHITECTURAL FOOTER
      ================================================================== */}
      <footer className="relative z-20 border-t border-[#C5A368]/35 bg-[#EFECE6]/95 backdrop-blur-md py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <AuraLibLogo className="w-8 h-8" />
            <p className="text-xs text-[#6E5A4F] max-w-sm">
              AuraLib LK — “A new dimension of discovery.” Lotus Epistemic Colonnade, Cinnamon
              Gardens, Colombo 07, Sri Lanka.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-mono-code text-[#3A261A]">
            <button
              onClick={() => {
                setActiveTab('journey');
                navigate('/');
              }}
              className="hover:underline"
            >
              3D Journey
            </button>
            <button
              onClick={() => {
                setActiveTab('catalogue');
                navigate('/catalog');
              }}
              className="hover:underline"
            >
              Catalogue ({formattedBooks.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('categories');
                navigate('/categories');
              }}
              className="hover:underline"
            >
              Book Categories
            </button>
            <button
              onClick={() => {
                setActiveTab('mylibrary');
                navigate('/my-books');
              }}
              className="hover:underline"
            >
              Member Portal
            </button>
            {isAdmin && (
              <Link to="/admin" className="text-[#9B783E] hover:underline font-bold">
                Admin Portal
              </Link>
            )}
          </div>
        </div>
      </footer>

      {/* ==================================================================
          MODALS (3D BOOK INSPECTOR & SCHOLAR AUTHENTICATION)
      ================================================================== */}
      <BookDetailModal
        book={inspectedBook}
        onClose={() => setInspectedBook(null)}
        onReserveBook={handleReserveBook}
        onToggleSaved={handleToggleSaved}
        isSaved={inspectedBook ? savedBookIds.includes(inspectedBook.id) : false}
        currentUser={user}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingBookToReserve(null);
        }}
        onAuthSuccess={handleAuthSuccess}
        pendingActionLabel={pendingBookToReserve ? `Reserve “${pendingBookToReserve.title}”` : null}
      />
    </div>
  );
}
