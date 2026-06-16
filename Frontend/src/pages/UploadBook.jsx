import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import FileUploadZone from '../components/ui/FileUploadZone';
import UploadProgress from '../components/ui/UploadProgress';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';

export default function UploadBook() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    publisher_date: '',
    language: 'English',
    number_of_pages: '',
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a file to upload');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('publisher', formData.publisher);
    data.append('publisher_date', formData.publisher_date);
    data.append('language', formData.language);
    data.append('number_of_pages', formData.number_of_pages || 0);

    try {
      setUploading(true);
      const res = await api.post('/books/create', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Book uploaded successfully!');
      navigate(`/books/${res.data.book_id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload book');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <UploadProgress isUploading={uploading} />
      <main className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-4xl mb-2 text-[color:var(--color-text-1)]">Upload Book</h1>
            <p className="font-sans text-[color:var(--color-text-2)]">Add a new book to the library to start chatting with it.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="p-6 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="font-display text-xl mb-4 text-[color:var(--color-text-1)]">1. Select File</h2>
              <FileUploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
            </section>

            <section className="p-6 rounded-2xl space-y-5" style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="font-display text-xl mb-2 text-[color:var(--color-text-1)]">2. Book Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full font-sans text-sm outline-none rounded-lg"
                    style={{ background: 'var(--color-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Author *</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="w-full font-sans text-sm outline-none rounded-lg"
                    style={{ background: 'var(--color-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Publisher *</label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    required
                    className="w-full font-sans text-sm outline-none rounded-lg"
                    style={{ background: 'var(--color-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Publication Date *</label>
                  <input
                    type="date"
                    name="publisher_date"
                    value={formData.publisher_date}
                    onChange={handleChange}
                    required
                    className="w-full font-sans text-sm outline-none rounded-lg"
                    style={{ background: 'var(--color-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Language</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full font-sans text-sm outline-none rounded-lg"
                    style={{ background: 'var(--color-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Number of Pages (Optional)</label>
                  <input
                    type="number"
                    name="number_of_pages"
                    value={formData.number_of_pages}
                    onChange={handleChange}
                    className="w-full font-sans text-sm outline-none rounded-lg"
                    style={{ background: 'var(--color-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="font-sans font-medium text-base px-8 py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_14px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
                style={{ background: 'var(--color-amber)', color: 'var(--color-void)' }}
              >
                Upload Book
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
