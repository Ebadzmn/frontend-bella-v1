import axios from 'axios';
import { API_URL } from '../config/api';

export interface PostcodeValidation {
  postcode: string;
  latitude: number;
  longitude: number;
  city: string;
  county: string;
  region: string;
  country: string;
}

export interface AddressOption {
  line_1: string;
  line_2?: string;
  line_3?: string;
  post_town: string;
  county?: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

class PostcodeAPI {
  /**
   * Validate a UK postcode
   */
  async validatePostcode(postcode: string): Promise<PostcodeValidation> {
    const response = await axios.post(`${API_URL}/postcodes/validate`, {
      postcode,
    });
    return response.data.data;
  }

  /**
   * Get postcode autocomplete suggestions
   */
  async autocompletePostcode(partial: string): Promise<string[]> {
    if (partial.length < 2) {
      return [];
    }
    const response = await axios.get(`${API_URL}/postcodes/autocomplete`, {
      params: { q: partial },
    });
    return response.data.data;
  }

  /**
   * Look up addresses for a postcode
   */
  async lookupAddresses(postcode: string): Promise<AddressOption[]> {
    const response = await axios.post(`${API_URL}/postcodes/lookup`, {
      postcode,
    });
    return response.data.data;
  }

  /**
   * Get nearest postcodes to coordinates
   */
  async getNearestPostcodes(
    latitude: number,
    longitude: number,
    limit: number = 10
  ): Promise<PostcodeValidation[]> {
    const response = await axios.get(`${API_URL}/postcodes/nearest`, {
      params: { lat: latitude, lon: longitude, limit },
    });
    return response.data.data;
  }

  /**
   * Reverse geocode coordinates to postcode
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<PostcodeValidation> {
    const response = await axios.post(`${API_URL}/postcodes/reverse`, {
      latitude,
      longitude,
    });
    return response.data.data;
  }
}

export const postcodeAPI = new PostcodeAPI();
