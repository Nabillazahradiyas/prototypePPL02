const maxLogoBytes = 10 * 1024 * 1024;
const logoTypes = ["image/png", "image/jpeg", "image/webp"];

export async function prepareLogo(file) {
  if (file.size > maxLogoBytes) throw new Error("Ukuran logo melebihi batas 10 MB.");
  if (!logoTypes.includes(file.type)) throw new Error("Pilih logo PNG, JPEG, atau WebP.");

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    // Simpan versi untuk navigasi agar berkas besar tidak memenuhi localStorage.
    const scale = Math.min(1, 256 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    throw new Error("Logo gagal dibaca. Pilih gambar PNG, JPEG, atau WebP yang valid.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
