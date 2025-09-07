import React from 'react';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  averageRating: number;
}

const BookCard: React.FC<BookCardProps> = ({ id, title, author, coverImage, averageRating }) => {
  return (
    <div className="flex items-center p-4 bg-white rounded shadow hover:shadow-lg transition">
      <img
        src={coverImage}
        alt={title}
        className="w-20 h-28 object-cover rounded mr-4 border"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <div className="text-gray-600 mb-2">by {author}</div>
        <div className="text-yellow-500 font-bold">Rating: {averageRating.toFixed(1)} / 5</div>
      </div>
    </div>
  );
};

export default BookCard;
