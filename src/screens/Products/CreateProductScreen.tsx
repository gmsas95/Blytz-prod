import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { ProductService } from '../../services/productService';
import { ProductCategory } from '../../types/models/product';

interface FormData {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  subcategory: string;
  tags: string;
  quantity: string;
  sku: string;
  lowStockThreshold: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  shippingClass: string;
  specifications: string;
}

type RootStackParamList = {
  CreateProduct: undefined;
  ProductDetail: { productId: string };
  MyProducts: undefined;
};

export default function CreateProductScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    tags: '',
    quantity: '',
    sku: '',
    lowStockThreshold: '5',
    weight: '',
    length: '',
    width: '',
    height: '',
    shippingClass: 'standard',
    specifications: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const shippingClasses = [
    { label: 'Standard', value: 'standard' },
    { label: 'Express', value: 'express' },
    { label: 'Heavy', value: 'heavy' },
    { label: 'Fragile', value: 'fragile' },
  ];

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await ProductService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 0, // Allow multiple selection
      });

      if (result.assets) {
        setUploadingImages(true);
        const imageUris = result.assets.map(asset => asset.uri).filter(Boolean) as string[];
        setImages(prev => [...prev, ...imageUris]);
        setUploadingImages(false);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to create products');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a product title');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setLoading(true);

    try {
      let uploadedImages: string[] = [];
      
      if (images.length > 0) {
        const files = images.map(uri => ({
          uri,
          name: `product_${Date.now()}.jpg`,
          type: 'image/jpeg',
        }));
        
        uploadedImages = await ProductService.uploadProductImages(
          files as unknown as File[],
          'temp_product'
        );
      }

      const parsedSpecs = formData.specifications
        .split('\n')
        .reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {} as Record<string, string>);

      const productData = {
        sellerId: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        images: uploadedImages,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        inventory: {
          quantity: parseInt(formData.quantity),
          sku: formData.sku.trim(),
          lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        },
        specifications: parsedSpecs,
        shipping: {
          weight: parseFloat(formData.weight) || 0,
          dimensions: {
            length: parseFloat(formData.length) || 0,
            width: parseFloat(formData.width) || 0,
            height: parseFloat(formData.height) || 0,
          },
          shippingClass: formData.shippingClass,
        },
        status: 'active' as const,
        isAuction: false,
        variants: [],
      };

      const product = await ProductService.createProduct(productData);
      
      Alert.alert(
        'Success',
        'Product created successfully!',
        [
          {
            text: 'View Product',
            onPress: () => navigation.navigate('ProductDetail', { productId: product.id })
          },
          {
            text: 'Create Another',
            onPress: () => {
              setFormData({
                title: '',
                description: '',
                price: '',
                originalPrice: '',
                category: '',
                subcategory: '',
                tags: '',
                quantity: '',
                sku: '',
                lowStockThreshold: '5',
                weight: '',
                length: '',
                width: '',
                height: '',
                shippingClass: 'standard',
                specifications: '',
              });
              setImages([]);
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Product</Text>

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
            <Text style={styles.imagePickerText}>
              {uploadingImages ? 'Uploading...' : 'Add Images'}
            </Text>
          </TouchableOpacity>
          
          {images.length > 0 && (
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Product Title *"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description *"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={styles.input}
            placeholder="Price (RM) *"
            value={formData.price}
            onChangeText={(text) => handleInputChange('price', text)}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Original Price (RM) - Optional"
            value={formData.originalPrice}
            onChangeText={(text) => handleInputChange('originalPrice', text)}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <Picker
            selectedValue={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Subcategory"
            value={formData.subcategory}
            onChangeText={(text) => handleInputChange('subcategory', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChangeText={(text) => handleInputChange('tags', text)}
          />
        </View>

        {/* Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Quantity *"
            value={formData.quantity}
            onChangeText={(text) => handleInputChange('quantity', text)}
            keyboardType="number-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="SKU"
            value={formData.sku}
            onChangeText={(text) => handleInputChange('sku', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Low Stock Alert Threshold"
            value={formData.lowStockThreshold}
            onChangeText={(text) => handleInputChange('lowStockThreshold', text)}
            keyboardType="number-pad"
          />
        </View>

        {/* Shipping */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={formData.weight}
            onChangeText={(text) => handleInputChange('weight', text)}
            keyboardType="decimal-pad"
          />

          <View style={styles.dimensionsContainer}>
            <TextInput
              style={[styles.input, styles.dimensionInput]}
              placeholder="Length (cm)"
              value={formData.length}
              onChangeText={(text) => handleInputChange('length', text)}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, styles.dimensionInput]}
              placeholder="Width (cm)"
              value={formData.width}
              onChangeText={(text) => handleInputChange('width', text)}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, styles.dimensionInput]}
              placeholder="Height (cm)"
              value={formData.height}
              onChangeText={(text) => handleInputChange('height', text)}
              keyboardType="decimal-pad"
            />
          </View>

          <Picker
            selectedValue={formData.shippingClass}
            onValueChange={(value) => handleInputChange('shippingClass', value)}
            style={styles.picker}
          >
            {shippingClasses.map((cls) => (
              <Picker.Item key={cls.value} label={cls.label} value={cls.value} />
            ))}
          </Picker>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Specifications (format: key: value)
Example:
color: black
brand: samsung
model: galaxy-s21"
            value={formData.specifications}
            onChangeText={(text) => handleInputChange('specifications', text)}
            multiline
            numberOfLines={6}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Product</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  imagePicker: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dimensionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dimensionInput: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});