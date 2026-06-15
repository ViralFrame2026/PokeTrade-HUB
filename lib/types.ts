export type FeaturedCard = {
  id: string;
  image: string;
  name: string;
  set: string;
};

export type Listing = {
  id: string;
  cardMeta: string;
  description: string;
  image: string;
  location: string;
  price: string;
  seller: string;
  sellerId?: string;
  sellerRating: string;
  status: string;
  title: string;
  type: string;
  verified?: boolean;
};
