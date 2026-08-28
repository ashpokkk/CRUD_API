const { z } = require("zod");

const bookSchema = z.object({
  title: z.string(),
  product_url: z.string().url().refine(
    (url) => url.startsWith("https://"),
    {
      message: "product_url must use HTTPS"
    }
  ),
  price_text: z.string(),
  price_gbp: z.number(),
  availability_text: z.string(),
  rating_text: z.string().nullable(),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string().datetime()
});

module.exports = { bookSchema };