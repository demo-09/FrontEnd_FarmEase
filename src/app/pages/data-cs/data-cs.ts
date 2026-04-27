import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-data',
  imports: [CommonModule],
  templateUrl: './data-cs.html',
  styleUrls: ['./data-cs.css']
})
export class DataComponent implements OnInit {

  apiData: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiData = [];

    this.dataService.getData().subscribe({
      next: (response: any) => {
        const records = response?.records ?? response?.data ?? [];
        if (!records.length) {
          this.errorMessage = 'No records found in API response.';
          this.isLoading = false;
          return;
        }

        this.apiData = records.map((item: any) => ({
          ...item,
          private_sector__no__: Number(item.private_sector__no__) || 0,
          cooperative_sector__no__: Number(item.cooperative_sector__no__) || 0,
          public_sector__no__: Number(item.public_sector__no__) || 0,
          total_number: Number(item.total_number) || 1, // avoid div-by-zero
          private_sector_capacity__tonnes_: Number(item.private_sector_capacity__tonnes_) || 0,
          cooperative_sector_capacity__tonnes_: Number(item.cooperative_sector_capacity__tonnes_) || 0,
          public_sector_capacity__tonnes_: Number(item.public_sector_capacity__tonnes_) || 0,
          total_capacity__tonnes_: Number(item.total_capacity__tonnes_) || 0
        }));

        this.isLoading = false;
      },

      error: (error: any) => {
        this.errorMessage = `Failed to load data: ${error.status === 401 ? 'API key invalid or blocked.' : error.message || 'Network error.'}`;
        this.isLoading = false;
        console.error('DataService error:', error);
      }
    });
  }

}
