'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import 'photoswipe/dist/photoswipe.css';
import Loader from '../components/Loader';

const Gallery = dynamic(() => import('react-photoswipe-gallery').then((module) => module.Gallery), { ssr: false });
const Item = dynamic(() => import('react-photoswipe-gallery').then((module) => module.Item), { ssr: false });

interface ImageData {
  data: {
    url_overridden_by_dest: string;
    thumbnail: string;
  };
}

export default function Home() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [after, setAfter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://www.reddit.com/r/memes.json?limit=50&after=${after}`);
      const newImages = res.data.data.children;
      setImages((prevImages) => [...prevImages, ...newImages]);
      setAfter(res.data.data.after);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchData();
  }, []);


  // Infinite Scroll
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 20 && !loading) {
      fetchData();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <main className="mb-16 overflow-x-hidden">
      <div className=' h-96 flex flex-col items-center justify-center text-white hero'>
        <p className='text-7xl text-center font-bold tracking-wider mb-8'>Memes Gallery</p>
        <p className='text-lg font-semibold'>Powered By : Reddit API</p>
      </div>
      <Gallery>
        <div className='gallery mt-24 max-w-7xl mx-auto'>
          {typeof window !== 'undefined' && images.length > 0 && images.map((img, index) => (
            <Item
              key={index}
              original={img.data.url_overridden_by_dest}
              thumbnail={img.data.thumbnail}
              height='800'
              width='800'
            >
              {({ ref, open }) => (
                <div className="cursor-pointer" onClick={open} key={index}>
                  <img
                    ref={ref}
                    src={img.data.thumbnail}
                    alt={`Image ${index}`}
                    className="w-full h-auto transition-transform transform hover:scale-105 m-8"
                  />
                </div>
              )}
            </Item>
          ))}
        </div>
      </Gallery>

      {loading && <div className="text-center mt-4"> <Loader /> </div>}
    </main>
  );
}
