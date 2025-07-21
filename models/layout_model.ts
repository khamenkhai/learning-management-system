import { Schema, model, Document } from "mongoose";

// Interfaces
interface FaqItem extends Document {
  question: string;
  answer: string;
}

interface Category extends Document {
  title: string;
}

interface BannerImage extends Document {
  public_id: string;
  url: string;
}

interface Layout extends Document {
  type: string;
  faq: FaqItem[];
  categories: Category[];
  banner: {
    image: BannerImage;
    title: string;
    subTitle: string;
  };
}

// Sub-schemas
const faqSchema = new Schema<FaqItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const categorySchema = new Schema<Category>({
  title: { type: String, required: true },
});

const bannerImageSchema = new Schema<BannerImage>({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
});

const layoutSchema = new Schema<Layout>({
  type: { type: String, required: true },
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: { type: String, required: true },
    subTitle: { type: String, required: true },
  },
});

// Model
const LayoutModel = model<Layout>("Layout", layoutSchema);
export default LayoutModel;
